
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    FeeGroupViewSet, FeeTypeViewSet, FeeMasterViewSet,
    FeeAllocationViewSet, FeePaymentViewSet
)

router = DefaultRouter()
router.register(r'groups', FeeGroupViewSet)
router.register(r'types', FeeTypeViewSet)
router.register(r'masters', FeeMasterViewSet)
router.register(r'allocations', FeeAllocationViewSet)
router.register(r'payments', FeePaymentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
