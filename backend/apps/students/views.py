
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Student, StudentPromotionHistory, SchoolLeavingCertificate
from .serializers import (
    StudentSerializer, CreateStudentSerializer, 
    StudentPromotionHistorySerializer, SchoolLeavingCertificateSerializer
)

from apps.core.mixins import SchoolFilterMixin
from apps.accounts.permissions import IsAdminOrTeacher

class StudentViewSet(SchoolFilterMixin, viewsets.ModelViewSet):
    queryset = Student.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CreateStudentSerializer
        return StudentSerializer
    filterset_fields = ['current_class', 'section', 'user__gender', 'user__profile__blood_group']
    search_fields = ['user__first_name', 'user__last_name', 'admission_number', 'father_name']
    ordering_fields = ['admission_number', 'user__first_name']
    
    @action(detail=False, methods=['post'], url_path='import')
    def import_students(self, request):
        import csv
        import io
        from django.db import transaction
        from django.contrib.auth import get_user_model
        from apps.classes.models import Class, Section
        from .models import Student
        
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
                    # Basic student data
                    first_name = row.get('first_name')
                    last_name = row.get('last_name')
                    email = row.get('email')
                    admission_number = row.get('admission_number')
                    class_name = row.get('class')
                    section_name = row.get('section')
                    
                    if not (first_name and last_name and admission_number):
                        errors.append(f"Missing required fields for row: {row}")
                        continue
                        
                    # Handle Class/Section
                    student_class = None
                    if class_name:
                        student_class, _ = Class.objects.get_or_create(school=school, name=class_name)
                        
                    student_section = None
                    if section_name and student_class:
                        student_section, _ = Section.objects.get_or_create(current_class=student_class, name=section_name)
                    
                    # Create User
                    if not email:
                        email = f"student_{admission_number}@school.local"
                        
                    user, created = User.objects.get_or_create(
                        email=email,
                        defaults={
                            'username': email,
                            'first_name': first_name,
                            'last_name': last_name,
                            'role': 'STUDENT',
                            'school': school,
                            'organization': school.organization
                        }
                    )
                    
                    if created:
                        user.set_password('student123')
                        user.save()
                        
                    # Create Student
                    Student.objects.get_or_create(
                        user=user,
                        school=school,
                        defaults={
                            'admission_number': admission_number,
                            'current_class': student_class,
                            'section': student_section,
                            'admission_date': row.get('admission_date') or '2026-04-27',
                            'father_name': row.get('father_name', 'N/A'),
                            'mother_name': row.get('mother_name', 'N/A'),
                        }
                    )
                    
                    success_count += 1
                except Exception as e:
                    errors.append(f"Error in row {row}: {str(e)}")
                    
        return Response({
            'success': success_count,
            'errors': errors
        }, status=status.HTTP_201_CREATED if success_count > 0 else status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='bulk-promote')
    def bulk_promote(self, request):
        from apps.classes.models import Class, Section
        from .models import StudentPromotionHistory, Student
        from apps.schools.models import AcademicYear
        from django.db import transaction

        student_ids = request.data.get('students', [])
        to_class_id = request.data.get('to_class')
        to_section_id = request.data.get('to_section')
        to_session_id = request.data.get('to_session')
        from_session_id = request.data.get('from_session')
        status_val = request.data.get('status', 'PROMOTED')

        if not (student_ids and to_class_id and to_session_id and from_session_id):
            return Response({'error': 'Missing required fields (students, to_class, to_session, from_session)'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            to_class = Class.objects.get(id=to_class_id)
            to_session = AcademicYear.objects.get(id=to_session_id)
            from_session = AcademicYear.objects.get(id=from_session_id)
            to_section = Section.objects.get(id=to_section_id) if to_section_id else None
            
            promoted_count = 0
            with transaction.atomic():
                students = Student.objects.filter(id__in=student_ids, school=request.user.school)
                for student in students:
                    # Create promotion history
                    StudentPromotionHistory.objects.create(
                        student=student,
                        from_session=from_session,
                        to_session=to_session,
                        from_class=student.current_class,
                        to_class=to_class,
                        promoted_by=request.user,
                        status=status_val
                    )
                    
                    # Update student record
                    student.current_class = to_class
                    student.section = to_section
                    student.save()
                    promoted_count += 1
            
            return Response({'message': f'Successfully promoted {promoted_count} students'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)



    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrTeacher()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        if user.role == 'STUDENT':
             # Students can only see themselves
             queryset = queryset.filter(user=user)
             
        return queryset

    from rest_framework.decorators import action
    from rest_framework.response import Response

    @action(detail=False, methods=['get'], url_path='me')
    def my_profile(self, request):
        user = request.user
        if user.role == 'STUDENT':
            student = self.get_queryset().filter(user=user).first()
            if student:
                serializer = self.get_serializer(student)
                return Response(serializer.data)
            return Response({'error': 'Student profile not found'}, status=404)
        return Response({'error': 'User is not a student'}, status=403)


class StudentPromotionHistoryViewSet(SchoolFilterMixin, viewsets.ModelViewSet):
    """Track student promotions."""
    queryset = StudentPromotionHistory.objects.all()
    serializer_class = StudentPromotionHistorySerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrTeacher]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['from_session', 'to_session', 'from_class', 'to_class', 'status']
    
    def perform_create(self, serializer):
        serializer.save(promoted_by=self.request.user)


class SchoolLeavingCertificateViewSet(SchoolFilterMixin, viewsets.ModelViewSet):
    """Generate and track SLCs."""
    queryset = SchoolLeavingCertificate.objects.all()
    serializer_class = SchoolLeavingCertificateSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrTeacher]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['academic_session']
    search_fields = ['slc_number', 'student__user__first_name', 'student__user__last_name']
    
    def perform_create(self, serializer):
        serializer.save(generated_by=self.request.user)
