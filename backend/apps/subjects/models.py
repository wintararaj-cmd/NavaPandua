from django.db import models
from apps.core.models import BaseModel

class Subject(BaseModel):
    school = models.ForeignKey(
        'schools.School',
        on_delete=models.CASCADE,
        related_name='subjects'
    )
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20)
    description = models.TextField(blank=True)
    subject_type = models.CharField(
        max_length=20,
        choices=[
            ('THEORY', 'Theory'),
            ('PRACTICAL', 'Practical'),
            ('BOTH', 'Both')
        ],
        default='THEORY'
    )
    
    class Meta:
        db_table = 'subjects'
        verbose_name = 'Subject'
        verbose_name_plural = 'Subjects'
        ordering = ['name']
        unique_together = ['school', 'code']

    def __str__(self):
        return f"{self.name} ({self.code})"
