
from rest_framework import viewsets, permissions, filters
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
