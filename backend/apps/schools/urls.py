"""
URL patterns for schools.
"""

from django.urls import path
from .views import (
    SchoolListCreateView, SchoolDetailView, SchoolSettingsView,
    AcademicYearListCreateView, HolidayListCreateView,
    MasterDataListCreateView, MasterDataDetailView
)

app_name = 'schools'

urlpatterns = [
    path('', SchoolListCreateView.as_view(), name='school_list_create'),
    path('<uuid:pk>/', SchoolDetailView.as_view(), name='school_detail'),
    path('<uuid:pk>/settings/', SchoolSettingsView.as_view(), name='school_settings'),
    path('<uuid:school_id>/academic-years/', AcademicYearListCreateView.as_view(), name='academic_years'),
    path('<uuid:school_id>/holidays/', HolidayListCreateView.as_view(), name='holidays'),
    path('<uuid:school_id>/master-data/', MasterDataListCreateView.as_view(), name='master_data_list'),
    path('<uuid:school_id>/master-data/<uuid:pk>/', MasterDataDetailView.as_view(), name='master_data_detail'),
]
