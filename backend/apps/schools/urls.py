"""
URL patterns for schools.
"""

from django.urls import path
from django.http import JsonResponse
from .views import (
    SchoolListCreateView, SchoolDetailView, SchoolSettingsView,
    AcademicYearListCreateView, HolidayListCreateView,
    MasterDataListCreateView, MasterDataDetailView,
    SchoolPublicPageView, SchoolGalleryImageViewSet
)

app_name = 'schools'

urlpatterns = [
    path('<str:school_id>/public-page/', SchoolPublicPageView.as_view(), name='school_public_page'),
    path('<str:school_id>/gallery/', SchoolGalleryImageViewSet.as_view({'get': 'list', 'post': 'create'}), name='school_gallery_list'),
    path('<str:school_id>/gallery/<uuid:pk>/', SchoolGalleryImageViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='school_gallery_detail'),
    path('test-ping/', lambda r: JsonResponse({"message": "pong"}), name='test_ping'),
    path('', SchoolListCreateView.as_view(), name='school_list_create'),
    path('<uuid:pk>/', SchoolDetailView.as_view(), name='school_detail'),
    path('<uuid:pk>/settings/', SchoolSettingsView.as_view(), name='school_settings'),
    path('<uuid:school_id>/academic-years/', AcademicYearListCreateView.as_view(), name='academic_years'),
    path('<uuid:school_id>/holidays/', HolidayListCreateView.as_view(), name='holidays'),
    path('<uuid:school_id>/master-data/', MasterDataListCreateView.as_view(), name='master_data_list'),
    path('<uuid:school_id>/master-data/<uuid:pk>/', MasterDataDetailView.as_view(), name='master_data_detail'),
]
