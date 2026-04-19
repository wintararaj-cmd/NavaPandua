from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PeriodViewSet, TimetableEntryViewSet

router = DefaultRouter()
router.register('periods', PeriodViewSet, basename='periods')
router.register('entries', TimetableEntryViewSet, basename='timetable-entries')

urlpatterns = [
    path('', include(router.urls)),
]
