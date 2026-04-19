from django.db import models
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Assignment, AssignmentSubmission
from .serializers import AssignmentSerializer, AssignmentSubmissionSerializer, GradeSubmissionSerializer
from apps.teachers.models import Teacher
from apps.notifications.services import NotificationService
from rest_framework.exceptions import ValidationError

class AssignmentViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AssignmentSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['target_class', 'section', 'subject']
    search_fields = ['title', 'description']

    def get_queryset(self):
        user = self.request.user
        queryset = Assignment.objects.filter(school=user.school)

        if user.role == 'TEACHER':
             try:
                 teacher = Teacher.objects.get(user=user)
                 queryset = queryset.filter(teacher=teacher)
             except Teacher.DoesNotExist:
                 return queryset.none()
        elif user.role == 'STUDENT':
             try:
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
                 assignment = serializer.save(school=user.school, teacher=teacher)
                 
                 # Send notification to students
                 students = assignment.target_class.students.all()
                 if assignment.section:
                     students = students.filter(section=assignment.section)
                 
                 users = [student.user for student in students if student.user]
                 
                 NotificationService.send_mass_notification(
                     users=users,
                     title=f"New Assignment: {assignment.title}",
                     message=f"A new assignment for {assignment.subject.name} has been posted.",
                     notification_type='ALERT',
                     # link=f"/assignments/{assignment.id}" # Frontend link
                 )
             except Teacher.DoesNotExist:
                 raise ValidationError("Teacher profile missing")
        else:
             raise ValidationError("Only teachers can create assignments")

    @action(detail=True, methods=['post'], url_path='submit')
    def submit_assignment(self, request, pk=None):
        assignment = self.get_object()
        user = request.user
        
        if user.role != 'STUDENT':
            return Response({"error": "Only students can submit assignments"}, status=status.HTTP_403_FORBIDDEN)
            
        try:
            from apps.students.models import Student
            student = Student.objects.get(user=user)
        except Student.DoesNotExist:
            return Response({"error": "Student profile not found"}, status=status.HTTP_400_BAD_REQUEST)

        # Check if already submitted
        if AssignmentSubmission.objects.filter(assignment=assignment, student=student).exists():
             return Response({"error": "You have already submitted this assignment"}, status=status.HTTP_400_BAD_REQUEST)

        # Handle file upload
        file = request.FILES.get('submitted_file')
        if not file:
             return Response({"error": "File is required"}, status=status.HTTP_400_BAD_REQUEST)

        submission = AssignmentSubmission.objects.create(
            assignment=assignment,
            student=student,
            submitted_file=file,
            remarks=request.data.get('remarks', '')
        )
        
        return Response(AssignmentSubmissionSerializer(submission).data, status=status.HTTP_201_CREATED)

class AssignmentSubmissionViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AssignmentSubmissionSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['assignment', 'student']

    def get_queryset(self):
        user = self.request.user
        queryset = AssignmentSubmission.objects.filter(assignment__school=user.school)
        
        if user.role == 'TEACHER':
             try:
                 teacher = Teacher.objects.get(user=user)
                 queryset = queryset.filter(assignment__teacher=teacher)
             except Teacher.DoesNotExist:
                 return queryset.none()
        elif user.role == 'STUDENT':
             try:
                 from apps.students.models import Student
                 student = Student.objects.get(user=user)
                 queryset = queryset.filter(student=student)
             except Student.DoesNotExist:
                 return queryset.none()
        return queryset

    @action(detail=True, methods=['post'], url_path='grade')
    def grade_submission(self, request, pk=None):
        submission = self.get_object()
        user = request.user
        
        if user.role != 'TEACHER': # Or Admin
             return Response({"error": "Only teachers can grade"}, status=status.HTTP_403_FORBIDDEN)
             
        # Verify teacher owns this assignment
        if submission.assignment.teacher.user != user:
             return Response({"error": "You can only grade your own assignments"}, status=status.HTTP_403_FORBIDDEN)

        serializer = GradeSubmissionSerializer(submission, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(graded_at=timezone.now())
            
            # Notify Student
            NotificationService.send_notification(
                user=submission.student.user,
                title="Assignment Graded",
                message=f"Your submission for {submission.assignment.title} has been graded.",
                notification_type='INFO'
            )
            
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
