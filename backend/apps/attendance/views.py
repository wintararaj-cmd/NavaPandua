
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import StudentAttendance, TeacherAttendance, LeaveType, LeaveApplication
from .serializers import (
    StudentAttendanceSerializer, TeacherAttendanceSerializer, 
    BulkAttendanceSerializer, LeaveTypeSerializer, LeaveApplicationSerializer
)
from apps.notifications.services import NotificationService

class AttendanceBaseViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()
        if not user.is_authenticated:
            return queryset.none()
        if user.role in ['SCHOOL_ADMIN', 'TEACHER'] and user.school:
            queryset = queryset.filter(school=user.school)
        return queryset

    def perform_create(self, serializer):
        if self.request.user.school:
            serializer.save(school=self.request.user.school)
        else:
            serializer.save()

class StudentAttendanceViewSet(AttendanceBaseViewSet):
    queryset = StudentAttendance.objects.all()
    serializer_class = StudentAttendanceSerializer
    filterset_fields = ['student', 'date', 'status', 'student__current_class', 'student__section']
    search_fields = ['student__first_name', 'student__last_name']

    @action(detail=False, methods=['get'], url_path='my-attendance')
    def my_attendance(self, request):
        user = request.user
        if user.role == 'STUDENT':
            student = user.student_profile
            attendances = self.get_queryset().filter(student=student).order_by('-date')
            serializer = self.get_serializer(attendances, many=True)
            return Response(serializer.data)
        return Response({'error': 'User is not a student'}, status=status.HTTP_403_FORBIDDEN)


    @action(detail=False, methods=['post'])
    def bulk_save(self, request):
        serializer = BulkAttendanceSerializer(data=request.data)
        if serializer.is_valid():
            date = serializer.validated_data['date']
            attendance_data = serializer.validated_data['attendance_data']
            school = request.user.school

            attendances = []
            for item in attendance_data:
                student_id = item.get('student')
                status_val = item.get('status', 'PRESENT')
                remarks = item.get('remarks', '')

                # Update or create
                attendance, created = StudentAttendance.objects.update_or_create(
                    school=school,
                    student_id=student_id,
                    date=date,
                    defaults={
                        'status': status_val,
                        'remarks': remarks
                    }
                )
                attendances.append(attendance)

            return Response({'message': f'Attendance saved for {len(attendances)} students'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='monthly-report')
    def monthly_report(self, request):
        year_param = request.query_params.get('year')
        month_param = request.query_params.get('month')
        class_id = request.query_params.get('class_id')
        
        if not all([year_param, month_param, class_id]):
            return Response({"error": "year, month and class_id are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            year = int(year_param)
            month = int(month_param)
        except (ValueError, TypeError):
            return Response({"error": "year and month must be valid integers"}, status=status.HTTP_400_BAD_REQUEST)

        from apps.students.models import Student
        from calendar import monthrange
        
        students = Student.objects.filter(current_class_id=class_id, school=request.user.school).order_by('roll_number', 'first_name')
        num_days = monthrange(year, month)[1]
        
        report = []
        for student in students:
            attendances = StudentAttendance.objects.filter(
                student=student,
                date__year=year,
                date__month=month
            )
            
            day_map = {a.date.day: a.status for a in attendances}
            counts = {
                'PRESENT': 0, 'ABSENT': 0, 'LATE': 0, 'HALF_DAY': 0, 'EXCUSED': 0
            }
            for status_val in day_map.values():
                counts[status_val] += 1
                
            report.append({
                'student_id': student.id,
                'name': student.user.get_full_name(),
                'roll_number': student.roll_number,
                'days': day_map,
                'summary': counts
            })
            
        return Response({
            'year': year,
            'month': month,
            'num_days': num_days,
            'report': report
        })

class TeacherAttendanceViewSet(AttendanceBaseViewSet):
    queryset = TeacherAttendance.objects.all()
    serializer_class = TeacherAttendanceSerializer
    filterset_fields = ['teacher', 'date', 'status']
    search_fields = ['teacher__first_name', 'teacher__last_name']

class LeaveTypeViewSet(AttendanceBaseViewSet):
    queryset = LeaveType.objects.all()
    serializer_class = LeaveTypeSerializer
    search_fields = ['name']

class LeaveApplicationViewSet(AttendanceBaseViewSet):
    queryset = LeaveApplication.objects.all()
    serializer_class = LeaveApplicationSerializer
    filterset_fields = ['status', 'applicant', 'leave_type']
    search_fields = ['reason', 'applicant__first_name', 'applicant__last_name']

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()
        
        if user.role == 'STUDENT':
             # Students only see their own leave applications
             queryset = queryset.filter(applicant=user)
        elif user.role == 'PARENT':
             # Parents see their children's leave applications
             # Assuming parent has children relationship
             queryset = queryset.filter(applicant__student_profile__parent=user)
             
        return queryset

    def perform_create(self, serializer):
        # Default status is PENDING, applicant is the current user
        serializer.save(
            school=self.request.user.school,
            applicant=self.request.user,
            status='PENDING'
        )
        
        # Send notification to school admin/teachers (Optional)
        try:
            NotificationService.send_leave_notification(
                leave_application=serializer.instance
            )
        except:
            pass

    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        leave = self.get_object()
        
        if request.user.role not in ['SCHOOL_ADMIN', 'SUPER_ADMIN', 'TEACHER']:
             return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

        # Logic: Teachers can only approve student leaves
        if request.user.role == 'TEACHER' and leave.applicant.role != 'STUDENT':
             return Response({"error": "Teachers can only approve student leaves"}, status=status.HTTP_403_FORBIDDEN)

        leave.status = 'APPROVED'
        leave.approved_by = request.user
        leave.save()
        
        # Create Attendance Records for the duration
        from datetime import timedelta
        current_date = leave.start_date
        while current_date <= leave.end_date:
            if leave.applicant.role == 'STUDENT':
                 try:
                     student = leave.applicant.student_profile
                     StudentAttendance.objects.update_or_create(
                         school=leave.school,
                         student=student,
                         date=current_date,
                         defaults={'status': 'EXCUSED', 'remarks': f"Leave Approved: {leave.leave_type.name}"}
                     )
                 except:
                     pass
            elif leave.applicant.role == 'TEACHER':
                 try:
                     teacher = leave.applicant.teacher_profile
                     TeacherAttendance.objects.update_or_create(
                         school=leave.school,
                         teacher=teacher,
                         date=current_date,
                         defaults={'status': 'ON_LEAVE', 'remarks': f"Leave Approved: {leave.leave_type.name}"}
                     )
                 except:
                     pass
            current_date += timedelta(days=1)
        
        # Notify Applicant
        NotificationService.send_notification(
            user=leave.applicant,
            title="Leave Approved",
            message=f"Your leave application for {leave.leave_type.name} from {leave.start_date} to {leave.end_date} has been approved.",
            notification_type='SUCCESS'
        )
        
        return Response(LeaveApplicationSerializer(leave).data)

    @action(detail=True, methods=['post'], url_path='reject')
    def reject(self, request, pk=None):
        leave = self.get_object()
        
        if request.user.role not in ['SCHOOL_ADMIN', 'SUPER_ADMIN', 'TEACHER']:
             return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
             
        reason = request.data.get('rejection_reason', 'No reason provided')
        leave.status = 'REJECTED'
        leave.approved_by = request.user
        leave.rejection_reason = reason
        leave.save()
        
        # Notify Applicant
        NotificationService.send_notification(
            user=leave.applicant,
            title="Leave Rejected",
            message=f"Your leave application has been rejected. Reason: {reason}",
            notification_type='WARNING'
        )
        
        return Response(LeaveApplicationSerializer(leave).data)
