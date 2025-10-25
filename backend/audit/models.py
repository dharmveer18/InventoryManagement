from django.db import models
from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

class AuditLog(models.Model):
    ACTION_TYPES = [
        ('CREATE', 'Create'),
        ('UPDATE', 'Update'),
        ('DELETE', 'Delete'),
        ('STOCK_ADJUST', 'Stock Adjustment'),
        ('REPORT_GENERATE', 'Report Generation'),
    ]

    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        on_delete=models.SET_NULL,
        related_name='audit_logs'
    )
    action = models.CharField(max_length=20, choices=ACTION_TYPES)
    
    # Generic foreign key to support any model
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.CharField(max_length=255)  # CharField to support both int and UUID
    content_object = GenericForeignKey('content_type', 'object_id')

    # State changes
    before_state = models.JSONField(null=True, blank=True)
    after_state = models.JSONField(null=True, blank=True)

    # Additional context
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    additional_context = models.JSONField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['content_type', 'object_id', 'created_at']),
            models.Index(fields=['actor', 'created_at']),
            models.Index(fields=['action', 'created_at'])
        ]
        ordering = ['-created_at']

    @classmethod
    def log_action(cls, actor, action, instance, before_state=None, after_state=None, **kwargs):
        """
        Create an audit log entry.
        
        Usage:
        AuditLog.log_action(
            actor=request.user,
            action='UPDATE',
            instance=item,
            before_state={'quantity': 5},
            after_state={'quantity': 10},
            ip_address=request.ip,
            user_agent=request.headers.get('User-Agent')
        )
        """
        return cls.objects.create(
            actor=actor,
            action=action,
            content_type=ContentType.objects.get_for_model(instance),
            object_id=str(instance.pk),
            before_state=before_state,
            after_state=after_state,
            **kwargs
        )
