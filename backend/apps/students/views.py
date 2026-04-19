
from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Student
from .serializers import StudentSerializer

from apps.core.mixins import SchoolFilterMixin
from apps.accounts.permissions import IsAdminOrTeacher

class StudentViewSet(SchoolFilterMixin, viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
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
