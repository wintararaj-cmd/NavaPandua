"""
Celery tasks for the fees app.
"""
from celery import shared_task
import logging

logger = logging.getLogger(__name__)


@shared_task(name='apps.fees.tasks.send_fee_reminders')
def send_fee_reminders():
    """Send fee payment reminders to parents/students on 1st of month."""
    try:
        from apps.fees.models import FeeAllocation
        from apps.notifications.services import NotificationService

        pending_allocations = FeeAllocation.objects.filter(
            status__in=['UNPAID', 'PARTIAL']
        ).select_related('student__user', 'fee_master__fee_type')

        notified_students = set()
        for allocation in pending_allocations:
            student_id = allocation.student_id
            if student_id not in notified_students:
                if allocation.student.user:
                    NotificationService.send_notification(
                        user=allocation.student.user,
                        title="Fee Payment Reminder",
                        message=f"You have pending fees. Please clear your dues to avoid late charges.",
                        notification_type='WARNING'
                    )
                notified_students.add(student_id)

        logger.info(f"Fee reminders sent to {len(notified_students)} students.")
    except Exception as e:
        logger.error(f"Error sending fee reminders: {e}")


@shared_task(name='apps.fees.tasks.calculate_late_fees')
def calculate_late_fees():
    """Calculate and apply late fees on the 5th of every month."""
    try:
        from apps.fees.models import FeeAllocation
        from django.utils import timezone
        from datetime import timedelta

        # Consider allocations created more than 30 days ago as overdue
        cutoff = timezone.now() - timedelta(days=30)
        overdue_allocations = FeeAllocation.objects.filter(
            status__in=['UNPAID', 'PARTIAL'],
            created_at__lt=cutoff
        )

        updated_count = 0
        for allocation in overdue_allocations:
            # Apply a 2% late fee on the remaining amount
            remaining = allocation.amount - allocation.paid_amount
            late_fee = remaining * 0.02
            if late_fee > 0:
                allocation.amount += late_fee
                allocation.save(update_fields=['amount'])
                updated_count += 1

        logger.info(f"Late fees calculated for {updated_count} allocations.")
    except Exception as e:
        logger.error(f"Error calculating late fees: {e}")
