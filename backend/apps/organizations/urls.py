"""
URL patterns for organizations.
"""

from django.urls import path
from .views import (
    OrganizationListCreateView,
    OrganizationDetailView,
    OrganizationSchoolsView,
    OrganizationDashboardView,
    OrganizationSettingsView,
)

app_name = 'organizations'

urlpatterns = [
    # Organization CRUD
    path('', OrganizationListCreateView.as_view(), name='organization_list_create'),
    path('<uuid:pk>/', OrganizationDetailView.as_view(), name='organization_detail'),
    
    # Organization Schools
    path('<uuid:pk>/schools/', OrganizationSchoolsView.as_view(), name='organization_schools'),
    
    # Organization Dashboard
    path('<uuid:pk>/dashboard/', OrganizationDashboardView.as_view(), name='organization_dashboard'),
    
    # Organization Settings
    path('<uuid:pk>/settings/', OrganizationSettingsView.as_view(), name='organization_settings'),
]
