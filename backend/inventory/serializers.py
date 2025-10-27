from rest_framework import serializers
from .models import Category, Item, InventoryTransaction, Alert, InventoryLevel

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'created_at', 'modified_at']

class InventoryTransactionSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item.name', read_only=True)
    performed_by_username = serializers.CharField(source='performed_by.username', read_only=True)

    class Meta:
        model = InventoryTransaction
        fields = [
            'id', 'item', 'item_name', 'delta', 'reason',
            'performed_by', 'performed_by_username', 'created_at'
        ]
        read_only_fields = ['performed_by']

class AlertSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item.name', read_only=True)

    class Meta:
        model = Alert
        fields = [
            'id', 'item', 'item_name', 'type', 'message',
            'triggered_at', 'resolved_at'
        ]

class StockAdjustmentSerializer(serializers.Serializer):
    # For detail adjust endpoint, item comes from the URL; keep optional to accept bodies without it
    item = serializers.PrimaryKeyRelatedField(queryset=Item.objects.all(), required=False)
    delta = serializers.IntegerField()
    note = serializers.CharField(required=False, allow_blank=True)
    reason = serializers.ChoiceField(
        choices=InventoryTransaction.REASON_CHOICES,
        default='manual'
    )

class BulkStockAdjustmentSerializer(serializers.Serializer):
    adjustments = StockAdjustmentSerializer(many=True)
    reason = serializers.ChoiceField(
        choices=InventoryTransaction.REASON_CHOICES,
        default='csv'
    )

class ItemSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
                source="category", queryset=Category.objects.all(), write_only=True)
    # Expose computed quantity as a read-only integer field sourced from Item.quantity property
    quantity = serializers.IntegerField(read_only=True)
    class Meta:
        model = Item
        fields = ["id", "name", "category", "price", "low_stock_threshold", "category_id", "quantity"]
        read_only_fields = ["quantity"]

    def validate_price(self, value):
      if value < 0:
        raise serializers.ValidationError("Price cannot be negative.")
      return value


class QuantityOnlySerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ["quantity"]
        extra_kwargs = {"quantity": {"min_value": 0}}




