from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.db import transaction

class Category(models.Model):
    name = models.CharField(max_length=120, unique=True)
    created_at = models.DateTimeField(default=timezone.now)
    modified_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.name

class Item(models.Model):
    name = models.CharField(max_length=120, unique=True)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="items")
    price = models.DecimalField(max_digits=12, decimal_places=2)
    low_stock_threshold = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(default=timezone.now)
    modified_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.name

    @property
    def quantity(self):
        """
        Computed, read-only stock level for this item.

        Backed by InventoryLevel via the reverse OneToOne relation
        `current_level` (defined on InventoryLevel.item with related_name="current_level").

        - InventoryLevel is created on the first stock adjustment (see services.ledger.apply_stock_delta)
        - Until then, accessing `current_level` may raise DoesNotExist; we report 0 in that case
        - API serializers expose this value as read-only to force adjustments through the ledger
        """
        try:
            return self.current_level.quantity
        except InventoryLevel.DoesNotExist:
            return 0

    def adjust_stock(self, delta, reason, user=None):
        from .services.ledger import apply_stock_delta
        return apply_stock_delta(
            item=self,
            delta=delta,
            user=user,
            reason=reason
        )

class InventoryLevel(models.Model):
    # Snapshot table storing the current on-hand quantity for an Item.
    # Created/updated by the ledger when adjustments occur; avoids summing
    # all InventoryTransaction rows on every read.
    # Access from Item via `item.current_level` thanks to related_name.
    item = models.OneToOneField(Item, on_delete=models.CASCADE, related_name='current_level')
    quantity = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=['quantity'])]  # For low-stock queries

class InventoryTransaction(models.Model):
    REASON_CHOICES = [
        ('manual', 'Manual Adjustment'),
        ('csv', 'CSV Import'),
        ('adjustment', 'Stock Adjustment'),
        ('init', 'Initial Stock')
    ]

    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='transactions')
    delta = models.IntegerField(help_text='Positive for additions, negative for subtractions')
    reason = models.CharField(max_length=20, choices=REASON_CHOICES)
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        on_delete=models.SET_NULL,
        related_name='inventory_transactions'
    )
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        indexes = [
            models.Index(fields=['item', 'created_at']),
            models.Index(fields=['performed_by', 'created_at'])
        ]

class Alert(models.Model):
    ALERT_TYPES = [
        ('low_stock', 'Low Stock Alert')
    ]

    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='alerts')
    type = models.CharField(max_length=20, choices=ALERT_TYPES)
    message = models.TextField()
    triggered_at = models.DateTimeField(default=timezone.now)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['type', 'resolved_at']),
            models.Index(fields=['item'])
        ]
