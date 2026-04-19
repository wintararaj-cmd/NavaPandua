
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdmissionEnquiryViewSet, AdmissionApplicationViewSet

app_name = 'admissions'

router = DefaultRouter()
router.register(r'enquiries', AdmissionEnquiryViewSet, basename='enquiry')
router.register(r'applications', AdmissionApplicationViewSet, basename='application')

urlpatterns = [
    path('', include(router.urls)),
]
