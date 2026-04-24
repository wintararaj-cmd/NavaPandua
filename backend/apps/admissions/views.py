
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
                from django.utils import timezone
                Student.objects.create(
                    user=user,
                    school=application.school,
                    admission_number=application.application_number,
                    current_class=application.target_class,
                    admission_date=application.admission_date or timezone.now().date(),
                    first_name=application.first_name,
                    middle_name=application.middle_name,
                    last_name=application.last_name,
                    date_of_birth=application.date_of_birth,
                    gender=application.gender,
                    place_of_birth=application.place_of_birth,
                    mother_tongue=application.mother_tongue,
                    nationality=application.nationality,
                    religion=application.religion,
                    caste=application.caste,
                    blood_group=application.blood_group,
                    
                    father_name=application.father_name,
                    father_phone=application.father_phone,
                    father_email=application.father_email,
                    father_qualification=application.father_qualification,
                    father_college=application.father_college,
                    father_occupation=application.father_occupation,
                    father_occupation_type=application.father_occupation_type,
                    father_organisation=application.father_organisation,
                    father_designation=application.father_designation,
                    father_income=application.father_income,
                    father_office_address=application.father_office_address,
                    
                    mother_name=application.mother_name,
                    mother_phone=application.mother_phone,
                    mother_email=application.mother_email,
                    mother_qualification=application.mother_qualification,
                    mother_college=application.mother_college,
                    mother_associated_with=application.mother_associated_with,
                    
                    address=application.address,
                    city=application.city,
                    state=application.state,
                    postal_code=application.postal_code,
                    
                    previous_school_name=application.previous_school_name,
                    previous_school_address=application.previous_school_address,
                    previous_school_city=application.previous_school_city,
                    previous_school_state=application.previous_school_state,
                    previous_school_country=application.previous_school_country,
                    previous_school_pincode=application.previous_school_pincode,
                    previous_school_principle_name=application.previous_school_principle_name,
                    previous_school_board=application.previous_school_board,
                    previous_school_class=application.previous_school_class,
                    previous_school_medium=application.previous_school_medium,
                    
                    is_single_parent=application.is_single_parent,
                    legal_guardian=application.legal_guardian,
                    is_guardian_father=application.is_guardian_father,
                    is_guardian_mother=application.is_guardian_mother,
                    
                    category=application.category,
                    staff_name=application.staff_name,
                    staff_id=application.staff_id,
                    
                    primary_contact_person=application.primary_contact_person,
                    primary_contact_phone=application.primary_contact_phone,
                    relationship_with_student=application.relationship_with_student,
                    
                    second_language=application.second_language,
                    third_language=application.third_language,
                    academic_performance=application.academic_performance,
                    
                    status='ACTIVE',
                    photo=application.photo,
                    father_photo=application.father_photo,
                    mother_photo=application.mother_photo,
                )
                
                # Generate PDF
                pdf_buffer = generate_admission_acknowledgement(application)
                pdf_content = pdf_buffer.getvalue()
                
                # Send Email Notification with Attachment
                from django.core.mail import EmailMessage
                from django.conf import settings
                from apps.notifications.services import NotificationService
                
                email_target = application.father_email or application.mother_email
                if email_target:
                    try:
                        email = EmailMessage(
                            subject=f"Admission Application Received - {application.application_number}",
                            body=f"Dear {application.father_name or 'Parent'},\n\nThank you for applying for admission at {application.school.name}. Please find attached the acknowledgement for your application {application.application_number}.\n\nRegards,\nAdmission Team",
                            from_email=settings.DEFAULT_FROM_EMAIL,
                            to=[email_target],
                        )
                        email.attach(f"acknowledgement_{application.application_number}.pdf", pdf_content, 'application/pdf')
                        email.send(fail_silently=True)
                        
                        # System notification for the school admin
                        NotificationService.send_notification(
                            user=application.school.admin if hasattr(application.school, 'admin') else None,
                            title="New Admission Application",
                            message=f"New application {application.application_number} received for {application.first_name}.",
                            notification_type='INFO'
                        )
                    except Exception as e:
                        print(f"Failed to send admission email: {e}")
                
                response = HttpResponse(pdf_content, content_type='application/pdf')
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
