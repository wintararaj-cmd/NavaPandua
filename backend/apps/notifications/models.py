from django.db import models
from apps.core.models import BaseModel
from django.contrib.auth import get_user_model

User = get_user_model()

class Notification(BaseModel):
    TYPE_CHOICES = [
        ('INFO', 'Information'),
        ('WARNING', 'Warning'),
        ('SUCCESS', 'Success'),
        ('ERROR', 'Error'),
        ('ALERT', 'Alert'),
    ]

    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='INFO')
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # Optional link to related object (generic relation can be used, but keeping it simple for now)
    link = models.CharField(max_length=255, blank=True, help_text="Link to frontend route")

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.recipient.email}"

class Announcement(BaseModel):
    TARGET_CHOICES = [
        ('ALL', 'All'),
        ('TEACHERS', 'Teachers Only'),
        ('STUDENTS', 'Students Only'),
        ('CLASS', 'Specific Class'),
    ]

    school = models.ForeignKey('schools.School', on_delete=models.CASCADE, related_name='announcements')
    title = models.CharField(max_length=255)
    content = models.TextField()
    target_audience = models.CharField(max_length=20, choices=TARGET_CHOICES, default='ALL')
    target_class = models.ForeignKey('classes.Class', on_delete=models.SET_NULL, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    is_active = models.BooleanField(default=True)
    expiry_date = models.DateField(null=True, blank=True)
    attachment = models.FileField(upload_to='announcements/', null=True, blank=True)

    class Meta:
        db_table = 'announcements'
        ordering = ['-created_at']

    def __str__(self):
        return self.title
