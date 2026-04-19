from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AssignmentViewSet, AssignmentSubmissionViewSet

router = DefaultRouter()
router.register('submissions', AssignmentSubmissionViewSet, basename='assignment-submissions')
router.register('', AssignmentViewSet, basename='assignments')

urlpatterns = [
    path('', include(router.urls)),
]
