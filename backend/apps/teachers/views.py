from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
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
    
    @action(detail=False, methods=['post'], url_path='import')
    def import_teachers(self, request):
        import csv
        import io
        from django.db import transaction
        from django.contrib.auth import get_user_model
        from .models import Teacher
        
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)
            
        decoded_file = file.read().decode('utf-8')
        io_string = io.StringIO(decoded_file)
        reader = csv.DictReader(io_string)
        
        school = request.user.school
        if not school:
             return Response({'error': 'No school context found'}, status=status.HTTP_400_BAD_REQUEST)

        User = get_user_model()
        success_count = 0
        errors = []
        
        with transaction.atomic():
            for row in reader:
                try:
                    first_name = row.get('first_name')
                    last_name = row.get('last_name')
                    email = row.get('email')
                    employee_id = row.get('employee_id')
                    
                    if not (first_name and last_name and employee_id):
                        errors.append(f"Missing required fields for row: {row}")
                        continue
                        
                    if not email:
                        email = f"emp_{employee_id}@school.local"
                        
                    user, created = User.objects.get_or_create(
                        email=email,
                        defaults={
                            'username': email,
                            'first_name': first_name,
                            'last_name': last_name,
                            'role': 'TEACHER',
                            'school': school,
                            'organization': school.organization
                        }
                    )
                    
                    if created:
                        user.set_password('staff123')
                        user.save()
                        
                    teacher, t_created = Teacher.objects.get_or_create(
                        user=user,
                        school=school,
                        defaults={
                            'employee_id': employee_id,
                            'department': row.get('department', 'General'),
                            'designation': row.get('designation', 'Teacher'),
                            'qualification': row.get('qualification', 'N/A'),
                            'joining_date': row.get('joining_date') or '2026-04-27',
                            'phone': row.get('phone', ''),
                            'basic_salary': row.get('basic_salary', 0),
                        }
                    )
                    
                    if t_created:
                        teacher.assigned_schools.add(school)
                    
                    success_count += 1
                except Exception as e:
                    errors.append(f"Error in row {row}: {str(e)}")
                    
        return Response({
            'success': success_count,
            'errors': errors
        }, status=status.HTTP_201_CREATED if success_count > 0 else status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='toggle_status')
    def toggle_status(self, request, pk=None):
        teacher = self.get_object()
        user = teacher.user
        user.is_active = not user.is_active
        user.save()
        
        teacher.status = 'ACTIVE' if user.is_active else 'INACTIVE'
        teacher.save()
        
        return Response({
            'status': 'success',
            'is_active': user.is_active,
            'teacher_status': teacher.status
        })



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
