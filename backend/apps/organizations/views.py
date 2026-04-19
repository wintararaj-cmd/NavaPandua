"""
Views for organization management.
"""

from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import timedelta

from .models import Organization, OrganizationSettings, OrganizationInvitation
from .serializers import (
    OrganizationSerializer,
    CreateOrganizationSerializer,
    OrganizationSettingsSerializer,
    OrganizationInvitationSerializer,
    OrganizationDashboardSerializer
)
from apps.core.exceptions import NotFoundException, ForbiddenException


class OrganizationListCreateView(generics.ListCreateAPIView):
    """
    List all organizations or create a new one.
    
    GET /api/v1/organizations/
    POST /api/v1/organizations/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateOrganizationSerializer
        return OrganizationSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        # Super admins see all organizations
        if user.is_superuser or user.is_super_admin:
            return Organization.objects.filter(is_deleted=False)
        
        # Users see organizations they own or are part of
        return Organization.objects.filter(
            Q(owner=user) | Q(users=user),
            is_deleted=False
        ).distinct()
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        organization = serializer.save()
        
        return Response({
            'success': True,
            'message': 'Organization created successfully.',
            'data': OrganizationSerializer(organization).data
        }, status=status.HTTP_201_CREATED)


class OrganizationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete an organization.
    
    GET /api/v1/organizations/{id}/
    PUT /api/v1/organizations/{id}/
    DELETE /api/v1/organizations/{id}/
    """
    serializer_class = OrganizationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Organization.objects.filter(is_deleted=False)
    
    def get_object(self):
        obj = super().get_object()
        user = self.request.user
        
        # Check permissions
        if not (user.is_superuser or user.is_super_admin or obj.owner == user):
            raise ForbiddenException('You do not have permission to access this organization.')
        
        return obj
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response({
            'success': True,
            'message': 'Organization updated successfully.',
            'data': serializer.data
        })
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()  # Soft delete
        
        return Response({
            'success': True,
            'message': 'Organization deleted successfully.'
        }, status=status.HTTP_200_OK)


class OrganizationSchoolsView(generics.ListAPIView):
    """
    List all schools in an organization.
    
    GET /api/v1/organizations/{id}/schools/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def list(self, request, *args, **kwargs):
        from apps.schools.models import School
        from apps.schools.serializers import SchoolSerializer
        
        organization_id = kwargs.get('pk')
        
        try:
            organization = Organization.objects.get(id=organization_id, is_deleted=False)
        except Organization.DoesNotExist:
            raise NotFoundException('Organization not found.')
        
        schools = School.objects.filter(
            organization=organization,
            is_deleted=False
        )
        
        serializer = SchoolSerializer(schools, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data
        })


class OrganizationDashboardView(APIView):
    """
    Get organization dashboard statistics.
    
    GET /api/v1/organizations/{id}/dashboard/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, pk):
        try:
            organization = Organization.objects.get(id=pk, is_deleted=False)
        except Organization.DoesNotExist:
            raise NotFoundException('Organization not found.')
        
        # Check permissions
        user = request.user
        if not (user.is_superuser or user.is_super_admin or organization.owner == user):
            raise ForbiddenException('You do not have permission to access this dashboard.')
        
        # Calculate statistics
        from apps.schools.models import School
        from apps.students.models import Student
        from apps.teachers.models import Teacher
        from apps.classes.models import Class
        from apps.fees.models import FeeTransaction
        from apps.attendance.models import Attendance
        
        total_schools = School.objects.filter(
            organization=organization,
            is_deleted=False
        ).count()
        
        total_students = Student.objects.filter(
            school__organization=organization,
            is_deleted=False
        ).count()
        
        active_students = Student.objects.filter(
            school__organization=organization,
            is_deleted=False,
            status='ACTIVE'
        ).count()
        
        total_teachers = Teacher.objects.filter(
            school__organization=organization,
            is_deleted=False
        ).count()
        
        active_teachers = Teacher.objects.filter(
            school__organization=organization,
            is_deleted=False,
            employment_status='ACTIVE'
        ).count()
        
        total_classes = Class.objects.filter(
            school__organization=organization,
            is_deleted=False
        ).count()
        
        # Revenue calculations
        total_revenue = FeeTransaction.objects.filter(
            student__school__organization=organization,
            status='PAID'
        ).aggregate(total=Sum('amount_paid'))['total'] or 0
        
        pending_fees = FeeTransaction.objects.filter(
            student__school__organization=organization,
            status='PENDING'
        ).aggregate(total=Sum('amount_due'))['total'] or 0
        
        # Recent admissions (last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        recent_admissions = Student.objects.filter(
            school__organization=organization,
            created_at__gte=thirty_days_ago
        ).count()
        
        # Attendance rate (last 7 days)
        seven_days_ago = timezone.now() - timedelta(days=7)
        total_attendance = Attendance.objects.filter(
            student__school__organization=organization,
            date__gte=seven_days_ago
        ).count()
        
        present_count = Attendance.objects.filter(
            student__school__organization=organization,
            date__gte=seven_days_ago,
            status='PRESENT'
        ).count()
        
        attendance_rate = (present_count / total_attendance * 100) if total_attendance > 0 else 0
        
        data = {
            'total_schools': total_schools,
            'total_students': total_students,
            'total_teachers': total_teachers,
            'total_classes': total_classes,
            'active_students': active_students,
            'active_teachers': active_teachers,
            'total_revenue': total_revenue,
            'pending_fees': pending_fees,
            'recent_admissions': recent_admissions,
            'attendance_rate': round(attendance_rate, 2)
        }
        
        serializer = OrganizationDashboardSerializer(data)
        
        return Response({
            'success': True,
            'data': serializer.data
        })


class OrganizationSettingsView(generics.RetrieveUpdateAPIView):
    """
    Get or update organization settings.
    
    GET /api/v1/organizations/{id}/settings/
    PUT /api/v1/organizations/{id}/settings/
    """
    serializer_class = OrganizationSettingsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        organization_id = self.kwargs.get('pk')
        
        try:
            organization = Organization.objects.get(id=organization_id, is_deleted=False)
        except Organization.DoesNotExist:
            raise NotFoundException('Organization not found.')
        
        # Check permissions
        user = self.request.user
        if not (user.is_superuser or user.is_super_admin or organization.owner == user):
            raise ForbiddenException('You do not have permission to access these settings.')
        
        settings, created = OrganizationSettings.objects.get_or_create(
            organization=organization
        )
        
        return settings
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response({
            'success': True,
            'message': 'Settings updated successfully.',
            'data': serializer.data
        })
