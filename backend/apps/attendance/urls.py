
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    StudentAttendanceViewSet, TeacherAttendanceViewSet,
    LeaveTypeViewSet, LeaveApplicationViewSet
)

router = DefaultRouter()
router.register('students', StudentAttendanceViewSet, basename='student-attendance')
router.register('teachers', TeacherAttendanceViewSet, basename='teacher-attendance')
router.register('leave-types', LeaveTypeViewSet, basename='leave-types')
router.register('leaves', LeaveApplicationViewSet, basename='leave-applications')

urlpatterns = [
    path('history/', StudentAttendanceViewSet.as_view({'get': 'my_attendance'}), name='attendance-history'),
    path('', include(router.urls)),
]
