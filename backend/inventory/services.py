from decimal import Decimal
from typing import Optional, Union
from django.db import transaction
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.utils import timezone

from inventory.models import Item, Category, InventoryTransaction, Alert, InventoryLevel
from audit.models import AuditLog

User = get_user_model()

class InventoryError(Exception):
    """Base class for inventory-related exceptions"""
    pass

class InsufficientStockError(InventoryError):
    """Raised when attempting to reduce stock below zero"""
    pass

def create_item(
    name: str,
    category: Category,
    price: Union[Decimal, float],
    low_stock_threshold: int = 0,
    initial_stock: int = 0,
    user: Optional[User] = None
) -> Item:
    """
    Create a new inventory item with initial stock level.
    
    Args:
        name: Item name
        category: Category instance
        price: Item price
        low_stock_threshold: Quantity to trigger low stock alerts
        initial_stock: Initial quantity
        user: User performing the action
    
    Returns:
        Created Item instance
    """
    with transaction.atomic():
        # Create the item
        item = Item.objects.create(
            name=name,
            category=category,
            price=Decimal(str(price)),
            low_stock_threshold=low_stock_threshold
        )

        # Set initial stock level
        if initial_stock > 0:
            InventoryLevel.objects.create(
                item=item,
                quantity=initial_stock
            )
            
            # Record the transaction
            InventoryTransaction.objects.create(
                item=item,
                delta=initial_stock,
                reason='init',
                performed_by=user
            )

        # Log the action
        AuditLog.log_action(
            actor=user,
            action='CREATE',
            instance=item,
            after_state={
                'name': name,
                'category': category.name,
                'price': str(price),
                'low_stock_threshold': low_stock_threshold,
                'initial_stock': initial_stock
            }
        )

        return item

def adjust_stock(
    item: Item,
    delta: int,
    reason: str,
    user: Optional[User] = None,
    note: str = ''
) -> InventoryTransaction:
    """
    Adjust item stock level and record the transaction.
    
    Args:
        item: Item to adjust
        delta: Quantity change (positive for additions, negative for reductions)
        reason: Why the adjustment is being made
        user: User performing the action
        note: Optional note about the adjustment
    
    Returns:
        Created InventoryTransaction instance
    
    Raises:
        InsufficientStockError: If adjustment would result in negative stock
    """
    with transaction.atomic():
        # Get or create inventory level
        level, created = InventoryLevel.objects.select_for_update().get_or_create(
            item=item,
            defaults={'quantity': 0}
        )

        # Calculate new quantity
        new_quantity = level.quantity + delta
        if new_quantity < 0:
            raise InsufficientStockError(
                f"Cannot reduce stock by {abs(delta)}. Only {level.quantity} available."
            )

        # Record old state for audit
        old_quantity = level.quantity

        # Update stock level
        level.quantity = new_quantity
        level.save()

        # Create transaction record
        transaction = InventoryTransaction.objects.create(
            item=item,
            delta=delta,
            reason=reason,
            performed_by=user
        )

        # Check for low stock alert
        if new_quantity <= item.low_stock_threshold:
            Alert.objects.get_or_create(
                item=item,
                type='low_stock',
                resolved_at__isnull=True,
                defaults={
                    'message': f'Low stock alert: {item.name} ({new_quantity} remaining)'
                }
            )
        elif old_quantity <= item.low_stock_threshold and new_quantity > item.low_stock_threshold:
            # Resolve any existing low stock alerts
            Alert.objects.filter(
                item=item,
                type='low_stock',
                resolved_at__isnull=True
            ).update(resolved_at=timezone.now())

        # Log the action
        AuditLog.log_action(
            actor=user,
            action='STOCK_ADJUST',
            instance=item,
            before_state={'quantity': old_quantity},
            after_state={'quantity': new_quantity},
            additional_context={
                'delta': delta,
                'reason': reason,
                'note': note
            }
        )

        return transaction

def bulk_stock_update(
    updates: list[dict],
    reason: str,
    user: Optional[User] = None
) -> list[InventoryTransaction]:
    """
    Update stock levels for multiple items at once.
    
    Args:
        updates: List of dicts with keys: 'item_id', 'delta'
        reason: Why the adjustments are being made
        user: User performing the action
    
    Returns:
        List of created InventoryTransaction instances
    
    Raises:
        InsufficientStockError: If any adjustment would result in negative stock
    """
    transactions = []
    
    with transaction.atomic():
        # Pre-fetch all items to verify they exist
        item_ids = [update['item_id'] for update in updates]
        items = {
            item.id: item 
            for item in Item.objects.filter(id__in=item_ids)
        }
        
        # Validate all items exist
        missing_items = set(item_ids) - set(items.keys())
        if missing_items:
            raise ValidationError(f"Items not found: {missing_items}")

        # Process each update
        for update in updates:
            item = items[update['item_id']]
            transaction = adjust_stock(
                item=item,
                delta=update['delta'],
                reason=reason,
                user=user
            )
            transactions.append(transaction)

    return transactions

def resolve_alert(alert: Alert, user: Optional[User] = None) -> Alert:
    """
    Mark an alert as resolved.
    
    Args:
        alert: Alert to resolve
        user: User performing the action
    
    Returns:
        Updated Alert instance
    """
    with transaction.atomic():
        if not alert.resolved_at:
            alert.resolved_at = timezone.now()
            alert.save()

            AuditLog.log_action(
                actor=user,
                action='ALERT_RESOLVE',
                instance=alert,
                before_state={'resolved_at': None},
                after_state={'resolved_at': alert.resolved_at.isoformat()}
            )

    return alert