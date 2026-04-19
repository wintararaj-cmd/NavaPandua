from django.db import models
from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import LiveClass
from .serializers import LiveClassSerializer
from apps.teachers.models import Teacher
from rest_framework.exceptions import ValidationError
from apps.notifications.services import NotificationService

class LiveClassViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = LiveClassSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['target_class', 'section', 'subject', 'platform']
    search_fields = ['title', 'description']

    def get_queryset(self):
        user = self.request.user
        queryset = LiveClass.objects.filter(school=user.school)
        
        if user.role == 'TEACHER':
            try:
                teacher = Teacher.objects.get(user=user)
                queryset = queryset.filter(teacher=teacher)
            except Teacher.DoesNotExist:
                return queryset.none()
        elif user.role == 'STUDENT':
             try:
                 # Assuming related_name='student_profile' or OneToOne
                 # Based on populate_data, Student is a separate model linked to User
                 from apps.students.models import Student
                 student = Student.objects.get(user=user)
                 queryset = queryset.filter(
                     target_class=student.current_class
                 ).filter(
                     models.Q(section=student.section) | models.Q(section__isnull=True)
                 )
             except Student.DoesNotExist:
                 return queryset.none()
                 
        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        if not user.school:
             raise ValidationError("User must belong to a school")

        if user.role == 'TEACHER':
             try:
                 teacher = Teacher.objects.get(user=user)
                 live_class = serializer.save(school=user.school, teacher=teacher)
                 
                 # Notify students
                 students = live_class.target_class.students.all()
                 if live_class.section:
                     students = students.filter(section=live_class.section)
                 
                 users = [student.user for student in students if student.user]
                 
                 NotificationService.send_mass_notification(
                     users=users,
                     title=f"New Live Class: {live_class.title}",
                     message=f"A live class for {live_class.subject.name} is scheduled at {live_class.scheduled_at}.",
                     notification_type='ALERT'
                 )
             except Teacher.DoesNotExist:
                 raise ValidationError("Teacher profile not found")
        else:
             # For Admins, we might need to handle teacher assignment differently
             # For now, restrict to Teachers only
             raise ValidationError("Only teachers can schedule live classes directly")
