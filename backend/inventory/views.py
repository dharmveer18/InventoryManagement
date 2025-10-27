from rest_framework import viewsets, mixins, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q, Prefetch
from django.utils import timezone
import logging
from drf_spectacular.utils import extend_schema

from .models import Item, Category, InventoryTransaction, Alert, InventoryLevel
from .serializers import (
    ItemSerializer, CategorySerializer, InventoryTransactionSerializer,
    AlertSerializer, StockAdjustmentSerializer, BulkStockAdjustmentSerializer,
    QuantityOnlySerializer,
)
from .services import ledger, inventory
from django.conf import settings
from users.permissions import IsViewerOrReadOnly, IsManagerOrAbove, RequireModelPerm

logger = logging.getLogger(__name__)

class ItemPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 100

class ItemViewSet(viewsets.ModelViewSet):
    serializer_class = ItemSerializer
    permission_classes = [IsViewerOrReadOnly]
    pagination_class = ItemPagination

    def get_queryset(self):
        logger.info("ItemViewSet.get_queryset called")
        queryset = inventory.get_items()
        logger.info(f"Found {queryset.count()} items")
        return queryset

    def list(self, request, *args, **kwargs):
        logger.info("ItemViewSet.list called")
        logger.info(f"User: {request.user.username}")
        
        # Get paginated response
        response = super().list(request, *args, **kwargs)
        
        # Print raw response data
        print("=== Raw Response Data ===")
        print(response.data)
        print("=== End Raw Response Data ===")
        
        return response

    @extend_schema(
        responses=InventoryTransactionSerializer
    )
    @action(
        detail=True,
        methods=['post'],
        permission_classes=[IsManagerOrAbove],
        serializer_class=StockAdjustmentSerializer
    )
    def adjust_stock(self, request, pk=None):
        """Adjust stock quantity for a single item"""
        item = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            transaction = ledger.apply_stock_delta(
                item=item,
                delta=serializer.validated_data['delta'],
                user=request.user,
                note=serializer.validated_data.get('note', ''),
                reason=serializer.validated_data.get('reason', 'manual'),
                audit_context={
                    'ip_address': request.META.get('REMOTE_ADDR'),
                    'user_agent': request.META.get('HTTP_USER_AGENT', ''),
                }
            )
            return Response(InventoryTransactionSerializer(transaction).data)
        except ledger.InsufficientStockError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def get_permissions(self):
        """Enforce role- and permission-based access for item writes.
        - Viewers can read
        - Managers (and above) with model perm can create/update/destroy
        """
        if self.action in ("create", "update", "partial_update", "destroy"):
            # Require Manager+ and Django model change permission
            class ChangeItem(RequireModelPerm):
                required_perms = ["inventory.change_item"]
            return [IsManagerOrAbove(), ChangeItem()]
        return super().get_permissions()

    def get_serializer_class(self):
        """Limit non-admin updates to only the quantity field.
        Admins can edit all fields; managers/staff get QuantityOnlySerializer on updates.
        """
        if self.action in ("update", "partial_update") and not getattr(self.request.user, "is_admin", False):
            return QuantityOnlySerializer
        return super().get_serializer_class()

    @extend_schema(
        responses=InventoryTransactionSerializer(many=True)
    )
    @action(
        detail=False,
        methods=['post'],
        permission_classes=[IsManagerOrAbove],
        serializer_class=BulkStockAdjustmentSerializer
    )
    def bulk_adjust_stock(self, request):
        """Adjust stock quantities for multiple items"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            transactions = []
            for adjustment in serializer.validated_data['adjustments']:
                item = adjustment['item']
                requested_delta = adjustment['delta']
                # Clamp negative deltas so stock never goes below zero.
                # This makes bulk operations forgiving and avoids partial failures.
                if requested_delta < 0:
                    available = item.quantity  # uses InventoryLevel snapshot; 0 if none
                    if available + requested_delta < 0:
                        requested_delta = -available  # zero out the stock at most

                transaction = ledger.apply_stock_delta(
                    item=item,
                    delta=requested_delta,
                    user=request.user,
                    note=adjustment.get('note', ''),
                    reason=serializer.validated_data.get('reason', 'csv'),
                    audit_context={
                        'ip_address': request.META.get('REMOTE_ADDR'),
                        'user_agent': request.META.get('HTTP_USER_AGENT', ''),
                    }
                )
                transactions.append(transaction)
            return Response(
                InventoryTransactionSerializer(transactions, many=True).data
            )
        except ledger.InsufficientStockError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsViewerOrReadOnly]

    def get_queryset(self):
        logger.info("CategoryViewSet.get_queryset called")
        queryset = Category.objects.all()
        logger.info(f"Found {queryset.count()} categories")
        return queryset

    def list(self, request, *args, **kwargs):
        logger.info("=== CategoryViewSet.list API Call ===")
        logger.info(f"User: {request.user.username}")
        logger.info(f"Request Method: {request.method}")
        logger.info(f"Request Headers: {request.headers}")
        logger.info(f"Query Params: {request.query_params}")
        
        # Get paginated response
        response = super().list(request, *args, **kwargs)
        
        # Log detailed info
        logger.info("=== API Response Details ===")
        logger.info(f"Total categories in database: {self.get_queryset().count()}")
        logger.info(f"Response Status: {response.status_code}")
        logger.info(f"Response Headers: {response.headers}")
        logger.info(f"Page Size: {len(response.data['results'])}")
        logger.info(f"Full Response Data: {response.data}")
        logger.info(f"Categories Data: {[{'id': c['id'], 'name': c['name']} for c in response.data['results']]}")
        logger.info(f"Next Page: {response.data['next']}")
        logger.info(f"Previous Page: {response.data['previous']}")
        logger.info("=== End Category API Call ===")
        
        return response

    def get_permissions(self):
        """Admins only for writes; viewers (and above) can read.
        This explicitly tightens category create/update/delete to admins.
        """
        if self.action in ("create", "update", "partial_update", "destroy"):
            from users.permissions import IsAdmin
            return [IsAdmin()]
        return super().get_permissions()

class InventoryTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = InventoryTransactionSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        queryset = InventoryTransaction.objects.select_related('item', 'performed_by')
        
        # Filter by item if specified
        item_id = self.request.query_params.get('item')
        if item_id:
            queryset = queryset.filter(item_id=item_id)
            
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)
            
        return queryset.order_by('-created_at')

class AlertViewSet(viewsets.ModelViewSet):
    serializer_class = AlertSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # By default, show only unresolved alerts
        show_resolved = self.request.query_params.get('show_resolved', '').lower() == 'true'
        queryset = Alert.objects.select_related('item')
        
        if not show_resolved:
            queryset = queryset.filter(resolved_at__isnull=True)
            
        return queryset.order_by('-triggered_at')

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Mark an alert as resolved"""
        alert = self.get_object()
        if not alert.resolved_at:
            before_state = {'resolved_at': None}
            alert.resolved_at = timezone.now()
            alert.save()
            after_state = {'resolved_at': str(alert.resolved_at)}
            AuditLog.log_action(
                actor=request.user,
                action='UPDATE',
                instance=alert,
                before_state=before_state,
                after_state=after_state,
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT'),
                additional_context={'action': 'resolve'}
            )
        return Response(self.get_serializer(alert).data)