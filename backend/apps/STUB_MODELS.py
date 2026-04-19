# Stub models
from django.db import models
from apps.core.models import BaseModel

class Teacher(BaseModel):
    school = models.ForeignKey('schools.School', on_delete=models.CASCADE, related_name='teachers')
    user = models.OneToOneField('accounts.User', on_delete=models.CASCADE, related_name='teacher_profile')
    teacher_id = models.CharField(max_length=50, unique=True)
    employment_status = models.CharField(max_length=20, default='ACTIVE')
    
    class Meta:
        db_table = 'teachers'

class Class(BaseModel):
    school = models.ForeignKey('schools.School', on_delete=models.CASCADE, related_name='classes')
    name = models.CharField(max_length=100)
    
    class Meta:
        db_table = 'classes'

class Subject(BaseModel):
    school = models.ForeignKey('schools.School', on_delete=models.CASCADE, related_name='subjects')
    name = models.CharField(max_length=100)
    
    class Meta:
        db_table = 'subjects'

class FeeTransaction(BaseModel):
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE)
    amount_due = models.DecimalField(max_digits=10, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, default='PENDING')
    
    class Meta:
        db_table = 'fee_transactions'

class Attendance(BaseModel):
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE)
    date = models.DateField()
    status = models.CharField(max_length=20)
    
    class Meta:
        db_table = 'attendance'
