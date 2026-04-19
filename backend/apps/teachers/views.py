from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticated
from .models import Teacher
from .serializers import TeacherSerializer

from apps.core.mixins import SchoolFilterMixin
from apps.accounts.permissions import IsAdminOrTeacher, IsSchoolAdmin

class TeacherViewSet(SchoolFilterMixin, viewsets.ModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['department', 'designation', 'user__gender']
    search_fields = ['user__first_name', 'user__last_name', 'user__email', 'employee_id']
    ordering_fields = ['created_at', 'joining_date', 'user__first_name']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsSchoolAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()
        
        if not (user.is_superuser or getattr(user, 'is_super_admin', False)):
            from django.db.models import Q
            queryset = queryset.filter(Q(school=user.school) | Q(assigned_schools=user.school)).distinct()
            
        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        school = user.school
        
        if not school:
            from apps.schools.models import School
            if user.is_superuser:
                school = School.objects.filter(is_active=True).first()
        
        if not school:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"detail": "Please select a school context."})
            
        teacher = serializer.save(school=school)
        teacher.assigned_schools.add(school)
