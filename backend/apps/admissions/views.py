
from rest_framework import viewsets, permissions, filters
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from .models import AdmissionEnquiry, AdmissionApplication
from .serializers import AdmissionEnquirySerializer, AdmissionApplicationSerializer

class AdmissionEnquiryViewSet(viewsets.ModelViewSet):
    queryset = AdmissionEnquiry.objects.all()
    serializer_class = AdmissionEnquirySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'school']
    search_fields = ['student_name', 'parent_name', 'phone', 'email']
    ordering_fields = ['created_at', 'status']

    def get_queryset(self):
        # Filter by user's school if applicable
        user = self.request.user
        queryset = super().get_queryset()
        if user.role in ['SCHOOL_ADMIN', 'TEACHER'] and user.school:
           queryset = queryset.filter(school=user.school)
        return queryset
        
    def perform_create(self, serializer):
        # Auto-assign school if user belongs to one
        if self.request.user.school:
            serializer.save(school=self.request.user.school)
        else:
             serializer.save()

class AdmissionApplicationViewSet(viewsets.ModelViewSet):
    queryset = AdmissionApplication.objects.all()
    serializer_class = AdmissionApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'school', 'target_class']
    search_fields = ['application_number', 'first_name', 'last_name', 'parent_phone']
    ordering_fields = ['created_at', 'status']
    
    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()
        if user.role in ['SCHOOL_ADMIN', 'TEACHER'] and user.school:
           queryset = queryset.filter(school=user.school)
        return queryset

    def perform_create(self, serializer):
        if self.request.user.school:
            serializer.save(school=self.request.user.school)
        else:
            serializer.save()
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from .utils import generate_admission_acknowledgement
from apps.schools.models import School
from apps.classes.models import Class
from apps.students.models import Student
from django.db import transaction

class PublicAdmissionView(APIView):
    """
    Public API for submitting admission applications from the landing page.
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = AdmissionApplicationSerializer(data=request.data)
        if serializer.is_valid():
            with transaction.atomic():
                application = serializer.save()
                
                # Automatically create a student record as requested
                # Note: In a real system, this might be done after approval, 
                # but the user requested all info to be filled in student table.
                
                # We need a user for the student
                from apps.accounts.models import User
                username = f"app_{application.application_number.lower()}"
                email = application.father_email or f"{username}@school.local"
                
                user, created = User.objects.get_or_create(
                    email=email,
                    defaults={
                        'username': username,
                        'first_name': application.first_name,
                        'last_name': application.last_name,
                        'role': 'STUDENT',
                        'school': application.school,
                    }
                )
                if created:
                    user.set_password('Welcome@123')
                    user.save()
                
                # Create Student profile
                Student.objects.create(
                    user=user,
                    school=application.school,
                    admission_number=application.application_number,
                    current_class=application.target_class,
                    first_name=application.first_name,
                    middle_name=application.middle_name,
                    last_name=application.last_name,
                    date_of_birth=application.date_of_birth,
                    gender=application.gender,
                    father_name=application.father_name,
                    father_phone=application.father_phone,
                    mother_name=application.mother_name,
                    mother_phone=application.mother_phone,
                    address=application.address,
                    status='ACTIVE', # Or 'NEW'
                    photo=application.photo,
                    father_photo=application.father_photo,
                    mother_photo=application.mother_photo,
                )
                
                # Generate PDF
                pdf_buffer = generate_admission_acknowledgement(application)
                
                response = HttpResponse(pdf_buffer, content_type='application/pdf')
                response['Content-Disposition'] = f'attachment; filename="acknowledgement_{application.application_number}.pdf"'
                return response
        return Response(serializer.errors, status=400)

    def get(self, request):
        # Return schools and classes for the dropdowns
        schools = School.objects.filter(is_active=True, is_deleted=False)
        school_data = []
        for school in schools:
            classes = Class.objects.filter(school=school, is_deleted=False)
            school_data.append({
                'id': school.id,
                'name': school.name,
                'classes': [{'id': c.id, 'name': c.name} for c in classes]
            })
        return Response({'success': True, 'data': school_data})
