
from rest_framework import viewsets, permissions, filters
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
