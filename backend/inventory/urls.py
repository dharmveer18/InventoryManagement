from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ItemViewSet, CategoryViewSet, 
    InventoryTransactionViewSet, AlertViewSet
)

router = DefaultRouter()
router.register(r'items', ItemViewSet, basename='item')
router.register(r'categories', CategoryViewSet)
router.register(r'transactions', InventoryTransactionViewSet, basename='transaction')
router.register(r'alerts', AlertViewSet, basename='alert')

urlpatterns = [
path('', include(router.urls)),
]