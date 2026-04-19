
from django.db import models
from apps.core.models import BaseModel

class Class(BaseModel):
    school = models.ForeignKey(
        'schools.School',
        on_delete=models.CASCADE,
        related_name='classes'
    )
    name = models.CharField(max_length=50)  # e.g., "Class 10"
    code = models.CharField(max_length=20)  # e.g., "STD10"
    description = models.TextField(blank=True)
    
    class Meta:
        db_table = 'classes'
        verbose_name = 'Class'
        verbose_name_plural = 'Classes'
        ordering = ['name']
        unique_together = ['school', 'name']

    def __str__(self):
        return f"{self.name} - {self.school.name}"

class Section(BaseModel):
    class_group = models.ForeignKey(
        Class,
        on_delete=models.CASCADE,
        related_name='sections'
    )
    name = models.CharField(max_length=10)  # e.g., "A", "B"
    class_teacher = models.ForeignKey(
        'teachers.Teacher',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='class_teacher_of'
    )
    room_number = models.CharField(max_length=20, blank=True)
    capacity = models.IntegerField(default=40)
    
    class Meta:
        db_table = 'sections'
        verbose_name = 'Section'
        verbose_name_plural = 'Sections'
        ordering = ['class_group', 'name']
        unique_together = ['class_group', 'name']

    def __str__(self):
        return f"{self.class_group.name} - {self.name}"
