"""
Celery tasks for the analytics app.
"""
from celery import shared_task
import logging

logger = logging.getLogger(__name__)


@shared_task(name='apps.analytics.tasks.generate_monthly_reports')
def generate_monthly_reports():
    """Generate and cache monthly summary reports for all schools."""
    try:
        from apps.schools.models import School
        from apps.fees.models import FeeAllocation, FeePayment
        from apps.attendance.models import StudentAttendance
        from django.utils import timezone
        from django.db.models import Sum, Count
        import datetime

        now = timezone.now()
        last_month = now.month - 1 if now.month > 1 else 12
        year = now.year if now.month > 1 else now.year - 1

        schools = School.objects.all()
        for school in schools:
            # Fee collection summary
            collection = FeePayment.objects.filter(
                school=school,
                payment_date__year=year,
                payment_date__month=last_month
            ).aggregate(total=Sum('amount_paid'))['total'] or 0

            # Attendance summary
            present_count = StudentAttendance.objects.filter(
                school=school,
                date__year=year,
                date__month=last_month,
                status='PRESENT'
            ).count()

            total_count = StudentAttendance.objects.filter(
                school=school,
                date__year=year,
                date__month=last_month
            ).count()

            logger.info(
                f"School {school.name} - Month {last_month}/{year}: "
                f"Collection={collection}, Attendance={present_count}/{total_count}"
            )

        logger.info("Monthly reports generated successfully.")
    except Exception as e:
        logger.error(f"Error generating monthly reports: {e}")
