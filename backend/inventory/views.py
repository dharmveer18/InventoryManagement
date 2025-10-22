from rest_framework import viewsets, mixins, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Item, Category
from .serializers import ItemSerializer, CategorySerializer, QuantityOnlySerializer
from users.permissions import IsViewerOrReadOnly, IsManagerOrAbove, RequireModelPerm

class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.select_related("category").all()
    serializer_class = ItemSerializer
    permission_classes = [IsViewerOrReadOnly]  # GET for all roles; writes need Manager+

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            # Manager+ AND must have the model perms (from groups)
            class ChangeItem(RequireModelPerm): required_perms = ["inventory.change_item"]
            return [IsManagerOrAbove(), ChangeItem()]
        return super().get_permissions()

    def get_serializer_class(self):
        # Managers cannot change name/price/category via normal update; enforce server-side
        if self.action in ("update", "partial_update") and not self.request.user.is_admin:
            return QuantityOnlySerializer
        return super().get_serializer_class()

    @action(detail=True, methods=["post"])
    def adjust_quantity(self, request, pk=None):
        # Explicit action to bump quantity; also protected by IsManagerOrAbove + model perms
        class ChangeItem(RequireModelPerm): required_perms = ["inventory.change_item"]
        for perm in (IsManagerOrAbove(), ChangeItem()):
            if not perm.has_permission(request, self): return Response(status=status.HTTP_403_FORBIDDEN)
        item = self.get_object()
        try:
            delta = int(request.data.get("delta", "0"))
        except ValueError:
            return Response({"detail": "delta must be integer"}, status=400)
        item.quantity = item.quantity + delta
        item.save(update_fields=["quantity"])
        return Response(QuantityOnlySerializer(item).data)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsViewerOrReadOnly]

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            class ChangeCat(RequireModelPerm): required_perms = ["inventory.change_category"]
            # Only Admins should manage catalog in this example:
            from users.permissions import IsAdmin
            return [IsAdmin(), ChangeCat()]
        return super().get_permissions()
