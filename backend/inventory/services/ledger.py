from typing import Optional
from django.db import transaction
from django.core.exceptions import ValidationError
from django.utils import timezone
from inventory.models import (
    Item, 
    InventoryTransaction, 
    InventoryLevel,
    Alert
)
from audit.models import AuditLog

class LedgerError(Exception):
    """Base exception for ledger operations"""
    pass

class InsufficientStockError(LedgerError):
    """Raised when trying to reduce stock below zero"""
    pass

@transaction.atomic
def apply_stock_delta(
    *, 
    item: Item, 
    delta: int, 
    user=None, 
    note: str = "",
    reason: str = "manual"
) -> InventoryTransaction:
    """
    Apply a stock quantity change and record the transaction.
    
    Args:
        item: The item to adjust
        delta: Amount to change (positive for additions, negative for reductions)
        user: User making the change
        note: Optional note about the change
        reason: Why the change is being made
        
    Returns:
        Created InventoryTransaction record
        
    Raises:
        InsufficientStockError: If change would make stock negative
    """
    # Get or create inventory level with lock
    level, created = InventoryLevel.objects.select_for_update().get_or_create(
        item=item,
        defaults={'quantity': 0}
    )

    # Calculate new balance
    new_quantity = level.quantity + delta
    if new_quantity < 0:
        raise InsufficientStockError(
            f"Cannot reduce stock by {abs(delta)}. Only {level.quantity} available."
        )

    # Store old quantity for audit
    old_quantity = level.quantity

    # Update level
    level.quantity = new_quantity
    level.save()

    # Record transaction
    transaction = InventoryTransaction.objects.create(
        item=item,
        delta=delta,
        reason=reason,
        performed_by=user
    )

    # Check for low stock condition
    handle_low_stock_alert(item, new_quantity, old_quantity)

    # Record audit log
    AuditLog.log_action(
        actor=user,
        action='STOCK_ADJUST',
        instance=item,
        before_state={'quantity': old_quantity},
        after_state={'quantity': new_quantity},
        additional_context={'note': note, 'reason': reason}
    )

    return transaction

def handle_low_stock_alert(
    item: Item,
    new_quantity: int,
    old_quantity: int
) -> Optional[Alert]:
    """
    Create or resolve low stock alerts based on threshold.
    """
    if new_quantity <= item.low_stock_threshold:
        # Create new alert if stock is low
        alert, created = Alert.objects.get_or_create(
            item=item,
            type='low_stock',
            resolved_at__isnull=True,
            defaults={
                'message': f'Low stock alert: {item.name} ({new_quantity} remaining)'
            }
        )
        return alert if created else None
    
    elif old_quantity <= item.low_stock_threshold and new_quantity > item.low_stock_threshold:
        # Resolve existing alerts if stock is now sufficient
        Alert.objects.filter(
            item=item,
            type='low_stock',
            resolved_at__isnull=True
        ).update(resolved_at=timezone.now())
    
    return None