
from django.db import models
from django.conf import settings
from apps.core.models import BaseModel

class Teacher(BaseModel):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='teacher_profile'
    )
    school = models.ForeignKey(
        'schools.School',
        on_delete=models.CASCADE,
        related_name='teachers'
    )
    assigned_schools = models.ManyToManyField(
        'schools.School',
        related_name='allotted_teachers',
        blank=True
    )
    employee_id = models.CharField(max_length=50, unique=True)
    department = models.CharField(max_length=100)
    designation = models.CharField(max_length=100)
    qualification = models.CharField(max_length=255)
    joining_date = models.DateField()
    
    # Personal Info
    gender = models.CharField(max_length=10, choices=[('MALE', 'Male'), ('FEMALE', 'Female'), ('OTHER', 'Other')], default='MALE')
    date_of_birth = models.DateField(null=True, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    current_address = models.TextField(blank=True)
    
    # Salary & HR Info
    basic_salary = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    bank_account_no = models.CharField(max_length=50, blank=True)
    ifsc_code = models.CharField(max_length=20, blank=True)
    bank_name = models.CharField(max_length=100, blank=True)
    
    status = models.CharField(max_length=20, choices=[('ACTIVE', 'Active'), ('INACTIVE', 'Inactive'), ('RESIGNED', 'Resigned')], default='ACTIVE')

    
    class Meta:
        db_table = 'teachers'
        verbose_name = 'Teacher'
        verbose_name_plural = 'Teachers'
        ordering = ['user__first_name', 'user__last_name']
        indexes = [
            models.Index(fields=['employee_id']),
        ]

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.employee_id})"
