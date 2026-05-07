"""
Celery tasks for the notifications app.
"""
from celery import shared_task
import logging

logger = logging.getLogger(__name__)


@shared_task(name='apps.notifications.tasks.cleanup_old_notifications')
def cleanup_old_notifications():
    """Delete read notifications older than 30 days."""
    try:
        from apps.notifications.models import Notification
        from django.utils import timezone
        from datetime import timedelta

        cutoff_date = timezone.now() - timedelta(days=30)
        deleted_count, _ = Notification.objects.filter(
            is_read=True,
            created_at__lt=cutoff_date
        ).delete()

        logger.info(f"Cleaned up {deleted_count} old notifications.")
    except Exception as e:
        logger.error(f"Error cleaning up old notifications: {e}")
