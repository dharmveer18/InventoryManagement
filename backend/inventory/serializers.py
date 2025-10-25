from rest_framework import serializers
from .models import Category, Item, InventoryTransaction, Alert, InventoryLevel

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'created_at', 'modified_at']

class ItemSerializer(serializers.ModelSerializer):
    category = CategorySerializer()
    quantity = serializers.IntegerField(read_only=True)

    class Meta:
        model = Item
        fields = [
            'id', 'name', 'category', 'price',
            'quantity', 'low_stock_threshold',
            'created_at', 'modified_at'
        ]
        
    def to_representation(self, instance):
        data = super().to_representation(instance)
        print(f"Serializing item: {instance.name}, Quantity: {instance.quantity}")
        return data

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
    item = serializers.PrimaryKeyRelatedField(queryset=Item.objects.all())
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
#   item_id = serializers.PrimaryKeyRelatedField(queryset=Item.objects.all)

class ItemSerializer(serializers.ModelSerializer):
  category = CategorySerializer(read_only=True)
  category_id = serializers.PrimaryKeyRelatedField(
        source="category", queryset=Category.objects.all(), write_only=True)
  class Meta:
    model = Item
    fields = ["id", "name", "category", "price", "low_stock_threshold", "category_id", "quantity"]
    read_only_fields = []

    def validate_quantity(self, value):
      if value < 0:
          raise serializers.ValidationError("Quantity cannot be negative.")
      return value

    def validate_price(self, value):
      if value < 0:
        raise serializers.ValidationError("Price cannot be negative.")
      return value


class QuantityOnlySerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ["quantity"]
        extra_kwargs = {"quantity": {"min_value": 0}}

    # def create(self, validated_data):
    #     request = self.context.get("request")
    #     item = super().create(validated_data)
    #     #Audit logs
    #     return item

    # def update(self, instance, validated_data):
    #     request = self.context.get("request")
    #     role = getattr(getattr(request, "user", None), "profile", None)
    #     role_name = getattr(role, "role", None)

    #     old_qty = instance.quantity
    #     # Field-level restriction for managers
    #     if role_name == Role.MANAGER:
    #         disallowed = set(validated_data.keys()) - {"quantity"}
    #         if disallowed:
    #             raise serializers.ValidationError({"detail": "Managers can only update quantity."})

    #     updated_item = super().update(instance, validated_data)
    #     new_qty = updated_item.quantity

        # Decide what to log
        # if "quantity" in validated_data and new_qty != old_qty:
        #     InventoryAuditLog.objects.create(
        #         item=updated_item,
        #         user=getattr(request, "user", None),
        #         action=AuditAction.UPDATE_QUANTITY,
        #         old_quantity=old_qty,
        #         new_quantity=new_qty,
        #     )
        # else:
        #     InventoryAuditLog.objects.create(
        #         item=updated_item,
        #         user=getattr(request, "user", None),
        #         action=AuditAction.UPDATE_DETAILS,
        #         old_quantity=old_qty,
        #         new_quantity=updated_item.quantity,
        #         note="Details updated",
        #     )
        #return updated_item




