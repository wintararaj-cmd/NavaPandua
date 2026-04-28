"""
URL configuration for School Management System.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # API v1
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/organizations/', include('apps.organizations.urls')),
    path('api/v1/schools/', include('apps.schools.urls')),
    path('api/v1/students/', include('apps.students.urls')),
    path('api/v1/teachers/', include('apps.teachers.urls')),
    path('api/v1/classes/', include('apps.classes.urls')),
    path('api/v1/subjects/', include('apps.subjects.urls')),
    path('api/v1/admissions/', include('apps.admissions.urls')),
    path('api/v1/fees/', include('apps.fees.urls')),
    path('api/v1/exams/', include('apps.exams.urls')),
    path('api/v1/attendance/', include('apps.attendance.urls')),
    path('api/v1/live-classes/', include('apps.live_classes.urls')),
    path('api/v1/assignments/', include('apps.assignments.urls')),
    path('api/v1/library/', include('apps.library.urls')),
    path('api/v1/timetables/', include('apps.timetable.urls')),
    path('api/v1/notifications/', include('apps.notifications.urls')),
    path('api/v1/analytics/', include('apps.analytics.urls')),
    path('api/v1/inventory/', include('apps.inventory.urls')),
]


# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    
    # Debug toolbar
    try:
        import debug_toolbar
        urlpatterns = [path('__debug__/', include(debug_toolbar.urls))] + urlpatterns
    except ImportError:
        pass

# Customize admin site
admin.site.site_header = "School Management System"
admin.site.site_title = "School Admin Portal"
admin.site.index_title = "Welcome to School Management System"
