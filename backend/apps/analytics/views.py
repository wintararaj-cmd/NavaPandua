
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta

from apps.students.models import Student
from apps.teachers.models import Teacher
from apps.schools.models import School
from apps.organizations.models import Organization
from apps.attendance.models import StudentAttendance
from apps.fees.models import FeePayment
from .services import PerformanceAnalyticsService

class DashboardStatsView(APIView):
    """
    Get comprehensive dashboard statistics.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        school = user.school
        
        if not school and not user.is_superuser:
             return Response({"error": "User not associated with a school"}, status=status.HTTP_400_BAD_REQUEST)

        # Base filter
        student_filter = {}
        teacher_filter = {}
        attendance_filter = {'date': timezone.now().date()}
        payment_filter = {'payment_date__month': timezone.now().month, 'payment_date__year': timezone.now().year}

        if school:
            student_filter['school'] = school
            teacher_filter['school'] = school
            attendance_filter['school'] = school
            payment_filter['school'] = school

        if user.is_superuser:
            total_schools = School.objects.filter(is_active=True).count()
            total_organizations = Organization.objects.count()
        else:
            total_schools = 1 if school else 0
            total_organizations = 1 if school.organization else 0

        # 1. Counts
        total_students = Student.objects.filter(**student_filter).count()
        total_teachers = Teacher.objects.filter(**teacher_filter).count()
        
        # 2. Today's Attendance
        attendance_stats = {
            'present': 0,
            'absent': 0,
            'late': 0,
            'total_marked': 0,
            'percentage': 0
        }
        
        today_attendance = StudentAttendance.objects.filter(**attendance_filter).values('status').annotate(count=Count('status'))
        for item in today_attendance:
            status_val = item['status']
            count = item['count']
            attendance_stats['total_marked'] += count
            if status_val == 'PRESENT':
                attendance_stats['present'] = count
            elif status_val == 'ABSENT':
                attendance_stats['absent'] = count
            elif status_val == 'LATE':
                attendance_stats['late'] = count
        
        if attendance_stats['total_marked'] > 0:
             attendance_stats['percentage'] = round((attendance_stats['present'] + attendance_stats['late']) / attendance_stats['total_marked'] * 100, 1)

        # 3. Monthly Fee Collection
        monthly_collection = FeePayment.objects.filter(**payment_filter).aggregate(total=Sum('amount_paid'))['total'] or 0

        # 4. Attendance Trend (Last 7 Days)
        attendance_trend = []
        for i in range(6, -1, -1):
            date_val = timezone.now().date() - timedelta(days=i)
            day_stats = StudentAttendance.objects.filter(
                school=school, 
                date=date_val
            ).values('status').annotate(count=Count('status'))
            
            trend_item = {
                'date': date_val.strftime('%b %d'),
                'present': 0,
                'absent': 0
            }
            for item in day_stats:
                if item['status'] == 'PRESENT':
                    trend_item['present'] = item['count']
                elif item['status'] == 'ABSENT':
                    trend_item['absent'] = item['count']
            
            attendance_trend.append(trend_item)

        # Response
        return Response({
            'success': True,
            'data': {
                'total_students': total_students,
                'total_teachers': total_teachers,
                'total_schools': total_schools,
                'total_organizations': total_organizations,
                'attendance_today': attendance_stats,
                'attendance_trend': attendance_trend,
                'finance': {
                    'monthly_collection': monthly_collection,
                    'currency': 'INR'
                }
            }
        })

class PerformanceAnalyticsView(APIView):
    """
    Get academic performance analytics.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        school = user.school
        
        if not school and not user.is_superuser:
             return Response({"error": "User not associated with a school"}, status=status.HTTP_400_BAD_REQUEST)

        class_id = request.query_params.get('class_id')
        
        service = PerformanceAnalyticsService()
        class_stats = service.get_class_performance(school, class_id)
        top_students = service.get_top_students(school)

        return Response({
            'success': True,
            'data': {
                'class_performance': class_stats,
                'top_students': top_students
            }
        })

from django.http import HttpResponse
from .services import ReportExportService

class ReportViewSet(APIView):
    """
    Endpoints for exporting custom reports.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        school = user.school
        
        if not school:
             return Response({"error": "User not associated with a school"}, status=status.HTTP_400_BAD_REQUEST)

        report_type = request.query_params.get('type', 'students') # students, teachers, finance
        export_format = request.query_params.get('format', 'csv') # csv, excel
        
        service = ReportExportService()
        
        if report_type == 'students':
            df = service.export_students(school)
        elif report_type == 'teachers':
            df = service.export_teachers(school)
        elif report_type == 'finance':
            df = service.export_finance(school)
        else:
             return Response({"error": "Invalid report type"}, status=status.HTTP_400_BAD_REQUEST)

        if df.empty:
            return Response({"error": "No data available for this report"}, status=status.HTTP_404_NOT_FOUND)

        if export_format == 'excel':
            content = service.to_excel(df)
            content_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            extension = 'xlsx'
        else:
            content = service.to_csv(df)
            content_type = 'text/csv'
            extension = 'csv'

        filename = f"{report_type}_report_{school.name.replace(' ', '_')}.{extension}"
        response = HttpResponse(content, content_type=content_type)
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response

