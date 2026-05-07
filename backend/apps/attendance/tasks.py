"""
Celery tasks for the attendance app.
"""
from celery import shared_task
import logging

logger = logging.getLogger(__name__)


@shared_task(name='apps.attendance.tasks.send_attendance_reminders')
def send_attendance_reminders():
    """Send daily attendance reminders to teachers."""
    try:
        from apps.schools.models import School
        from apps.notifications.services import NotificationService

        schools = School.objects.all()
        for school in schools:
            teachers = school.teacher_set.filter(is_active=True)
            for teacher in teachers:
                if teacher.user:
                    NotificationService.send_notification(
                        user=teacher.user,
                        title="Attendance Reminder",
                        message="Please mark attendance for today's classes.",
                        notification_type='INFO'
                    )
        logger.info("Attendance reminders sent successfully.")
    except Exception as e:
        logger.error(f"Error sending attendance reminders: {e}")


@shared_task(name='apps.attendance.tasks.send_low_attendance_alerts')
def send_low_attendance_alerts():
    """Alert school admins about students with low attendance."""
    try:
        from django.db.models import Count, Q
        from apps.students.models import Student
        from apps.attendance.models import StudentAttendance
        from apps.notifications.services import NotificationService
        from django.utils import timezone
        from datetime import timedelta

        thirty_days_ago = timezone.now().date() - timedelta(days=30)

        students = Student.objects.filter(is_active=True).select_related('school', 'user')
        for student in students:
            total = StudentAttendance.objects.filter(
                student=student, date__gte=thirty_days_ago
            ).count()
            present = StudentAttendance.objects.filter(
                student=student, date__gte=thirty_days_ago, status='PRESENT'
            ).count()

            if total > 0 and (present / total) < 0.75:
                school_admins = student.school.user_set.filter(role='SCHOOL_ADMIN')
                for admin in school_admins:
                    NotificationService.send_notification(
                        user=admin,
                        title="Low Attendance Alert",
                        message=f"Student {student.user.get_full_name()} has attendance below 75% this month.",
                        notification_type='WARNING'
                    )
        logger.info("Low attendance alerts processed.")
    except Exception as e:
        logger.error(f"Error sending low attendance alerts: {e}")
