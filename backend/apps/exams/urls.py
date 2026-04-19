
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ExamGradeViewSet, ExamViewSet, 
    ExamScheduleViewSet, ExamResultViewSet
)

router = DefaultRouter()
router.register(r'grades', ExamGradeViewSet)
router.register(r'list', ExamViewSet)
router.register(r'schedules', ExamScheduleViewSet)
router.register(r'results', ExamResultViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
