from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    InventoryCategoryViewSet, InventoryItemViewSet, 
    InventoryStockViewSet, InventoryIssueViewSet, 
    InventoryTransactionViewSet
)

router = DefaultRouter()
router.register(r'categories', InventoryCategoryViewSet)
router.register(r'items', InventoryItemViewSet)
router.register(r'stock', InventoryStockViewSet)
router.register(r'issues', InventoryIssueViewSet)
router.register(r'transactions', InventoryTransactionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
