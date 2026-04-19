"""
Views for school management.
"""

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q

from .models import School, SchoolSettings, AcademicYear, Holiday
from .serializers import (
    SchoolSerializer, CreateSchoolSerializer, SchoolSettingsSerializer,
    AcademicYearSerializer, HolidaySerializer
)
from apps.core.exceptions import NotFoundException, ForbiddenException


class SchoolListCreateView(generics.ListCreateAPIView):
    """List all schools or create a new one."""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        return CreateSchoolSerializer if self.request.method == 'POST' else SchoolSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.is_super_admin:
            return School.objects.filter(is_deleted=False)
        return School.objects.filter(
            Q(organization__owner=user) | Q(organization__users=user),
            is_deleted=False
        ).distinct()


class SchoolDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a school."""
    serializer_class = SchoolSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = School.objects.filter(is_deleted=False)


class SchoolSettingsView(generics.RetrieveUpdateAPIView):
    """Get or update school settings."""
    serializer_class = SchoolSettingsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        school_id = self.kwargs.get('pk')
        school = School.objects.get(id=school_id, is_deleted=False)
        settings, _ = SchoolSettings.objects.get_or_create(school=school)
        return settings


class AcademicYearListCreateView(generics.ListCreateAPIView):
    """List or create academic years."""
    serializer_class = AcademicYearSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        school_id = self.kwargs.get('school_id')
        return AcademicYear.objects.filter(school_id=school_id, is_deleted=False)


class HolidayListCreateView(generics.ListCreateAPIView):
    """List or create holidays."""
    serializer_class = HolidaySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        school_id = self.kwargs.get('school_id')
        return Holiday.objects.filter(school_id=school_id, is_deleted=False)
