"""
Celery configuration for School Management System.
"""

import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('school_management')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# Celery Beat Schedule
app.conf.beat_schedule = {
    # Send daily attendance reminders at 8:00 AM
    'send-attendance-reminders': {
        'task': 'apps.attendance.tasks.send_attendance_reminders',
        'schedule': crontab(hour=8, minute=0),
    },
    # Send fee payment reminders at 9:00 AM on 1st of every month
    'send-fee-reminders': {
        'task': 'apps.fees.tasks.send_fee_reminders',
        'schedule': crontab(hour=9, minute=0, day_of_month=1),
    },
    # Calculate late fees at midnight on 5th of every month
    'calculate-late-fees': {
        'task': 'apps.fees.tasks.calculate_late_fees',
        'schedule': crontab(hour=0, minute=0, day_of_month=5),
    },
    # Send low attendance alerts every Monday at 10:00 AM
    'send-low-attendance-alerts': {
        'task': 'apps.attendance.tasks.send_low_attendance_alerts',
        'schedule': crontab(hour=10, minute=0, day_of_week=1),
    },
    # Generate monthly reports on 1st of every month at 6:00 AM
    'generate-monthly-reports': {
        'task': 'apps.analytics.tasks.generate_monthly_reports',
        'schedule': crontab(hour=6, minute=0, day_of_month=1),
    },
    # Clean up old notifications every day at 2:00 AM
    'cleanup-old-notifications': {
        'task': 'apps.notifications.tasks.cleanup_old_notifications',
        'schedule': crontab(hour=2, minute=0),
    },
}

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
