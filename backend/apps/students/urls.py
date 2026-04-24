
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    StudentViewSet, 
    StudentPromotionHistoryViewSet, SchoolLeavingCertificateViewSet
)

app_name = 'students'

router = DefaultRouter()
router.register(r'promotions', StudentPromotionHistoryViewSet, basename='student-promotion')
router.register(r'slc', SchoolLeavingCertificateViewSet, basename='slc')
router.register(r'', StudentViewSet, basename='student')

urlpatterns = [
    path('', include(router.urls)),
]
