
from django.db import models
from django.conf import settings
from apps.core.models import BaseModel

class Student(BaseModel):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='student_profile'
    )
    school = models.ForeignKey(
        'schools.School',
        on_delete=models.CASCADE,
        related_name='students'
    )
    admission_number = models.CharField(max_length=50, unique=True)
    roll_number = models.CharField(max_length=20, blank=True)
    
    # Academic Info
    current_class = models.ForeignKey(
        'classes.Class',
        on_delete=models.SET_NULL,
        null=True,
        related_name='students'
    )
    section = models.ForeignKey(
        'classes.Section',
        on_delete=models.SET_NULL,
        null=True,
        related_name='students'
    )
    admission_date = models.DateField()
    
    # Parent Info
    father_name = models.CharField(max_length=100)
    mother_name = models.CharField(max_length=100)
    guardian_phone = models.CharField(max_length=20, blank=True)
    
    class Meta:
        db_table = 'students'
        verbose_name = 'Student'
        verbose_name_plural = 'Students'
        ordering = ['user__first_name', 'user__last_name']
        indexes = [
            models.Index(fields=['roll_number']),
            models.Index(fields=['school', 'current_class', 'section']),
        ]

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.admission_number})"
