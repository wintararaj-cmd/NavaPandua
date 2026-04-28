
from rest_framework import viewsets, permissions, filters
from rest_framework.views import APIView
from rest_framework.decorators import action
from django.http import HttpResponse
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

from .services import AdmissionService

class AdmissionApplicationViewSet(viewsets.ModelViewSet):
    queryset = AdmissionApplication.objects.all()
    serializer_class = AdmissionApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'school', 'target_class']
    search_fields = ['application_number', 'first_name', 'last_name', 'father_phone']
    ordering_fields = ['created_at', 'status']
    
    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()
        if user.role in ['SCHOOL_ADMIN', 'TEACHER'] and user.school:
           queryset = queryset.filter(school=user.school)
        return queryset

    def perform_create(self, serializer):
        from django.db import transaction
        with transaction.atomic():
            if self.request.user.school:
                application = serializer.save(school=self.request.user.school)
            else:
                application = serializer.save()
            AdmissionService.handle_admission_fee(application)
            AdmissionService.ensure_student_record(application)

    def perform_update(self, serializer):
        from django.db import transaction
        with transaction.atomic():
            application = serializer.save()
            AdmissionService.handle_admission_fee(application)
            AdmissionService.ensure_student_record(application)



    @action(detail=True, methods=['get'])
    def download_form(self, request, pk=None):
        application = self.get_object()
        from .utils import generate_admission_acknowledgement
        pdf_buffer = generate_admission_acknowledgement(application)
        pdf_content = pdf_buffer.getvalue()
        response = HttpResponse(pdf_content, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="admission_form_{application.application_number}.pdf"'
        return response

    @action(detail=True, methods=['get'])
    def download_invoice(self, request, pk=None):
        application = self.get_object()
        from .utils import generate_admission_invoice
        pdf_buffer = generate_admission_invoice(application)
        pdf_content = pdf_buffer.getvalue()
        response = HttpResponse(pdf_content, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="admission_invoice_{application.application_number}.pdf"'
        return response
from rest_framework.response import Response
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
                AdmissionService.handle_admission_fee(application)
                # Student record will be created later when they come to school and pay the admission fees
                # and the status is changed to ADMITTED.
                
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
