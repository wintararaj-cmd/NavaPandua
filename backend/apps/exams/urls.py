
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
    path('student-schedule/', ExamScheduleViewSet.as_view({'get': 'student_schedule'}), name='student-exam-schedule'),
    path('my-results/', ExamResultViewSet.as_view({'get': 'my_results'}), name='student-exam-results'),
    path('', include(router.urls)),
]
