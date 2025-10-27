import logging
from typing import Optional, Dict, Any
from django.conf import settings
from django.db import transaction as db_transaction

try:
    from audit.models import AuditLog
except Exception:  # pragma: no cover - during early migrations/imports
    AuditLog = None  # type: ignore

logger = logging.getLogger(__name__)


def _coalesce_context(context: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    context = context or {}
    return {
        'ip_address': context.get('ip_address'),
        'user_agent': context.get('user_agent', ''),  # never None
        'note': context.get('note', ''),
        'reason': context.get('reason'),
        'correlation_id': context.get('correlation_id'),
        **{k: v for k, v in context.items() if k not in {'ip_address', 'user_agent', 'note', 'reason', 'correlation_id'}},
    }


def log_stock_adjust(
    *,
    item,
    actor,
    before_state: Dict[str, Any],
    after_state: Dict[str, Any],
    context: Optional[Dict[str, Any]] = None,
) -> None:
    """Facade to write audit logs for stock adjustments.

    - Respects settings.AUDIT_ENABLED (default True)
    - Coalesces missing fields (user_agent)
    - Uses on_commit to avoid rolling back main transaction on audit errors
    - Catches and logs exceptions to keep domain flow robust
    """
    if not getattr(settings, 'AUDIT_ENABLED', True):
        return

    ctx = _coalesce_context(context)

    def _write():
        if AuditLog is None:
            return
        try:
            AuditLog.log_action(
                actor=actor,
                action='STOCK_ADJUST',
                instance=item,
                before_state=before_state,
                after_state=after_state,
                ip_address=ctx.get('ip_address'),
                user_agent=ctx.get('user_agent', ''),
                additional_context={k: v for k, v in ctx.items() if k not in {'ip_address', 'user_agent'}},
            )
        except Exception:
            logger.exception('Audit logging failed for item %s', getattr(item, 'id', None))

    db_transaction.on_commit(_write)
