from django.db import models
from apps.core.models import BaseModel

class LiveClass(BaseModel):
    PLATFORM_CHOICES = [
        ('ZOOM', 'Zoom'),
        ('GOOGLE_MEET', 'Google Meet'),
        ('MICROSOFT_TEAMS', 'Microsoft Teams'),
        ('OTHER', 'Other'),
    ]

    school = models.ForeignKey('schools.School', on_delete=models.CASCADE, related_name='live_classes')
    teacher = models.ForeignKey('teachers.Teacher', on_delete=models.CASCADE, related_name='hosted_classes')
    target_class = models.ForeignKey('classes.Class', on_delete=models.CASCADE, related_name='live_classes')
    section = models.ForeignKey('classes.Section', on_delete=models.CASCADE, related_name='live_classes', null=True, blank=True)
    subject = models.ForeignKey('subjects.Subject', on_delete=models.CASCADE, related_name='live_classes')
    
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES, default='ZOOM')
    meeting_url = models.URLField()
    meeting_id = models.CharField(max_length=100, blank=True)
    meeting_password = models.CharField(max_length=100, blank=True)
    
    scheduled_at = models.DateTimeField()
    duration_minutes = models.IntegerField(default=60)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'live_classes'
        ordering = ['-scheduled_at']

    def __str__(self):
        return f"{self.title} - {self.subject.name} ({self.scheduled_at})"
