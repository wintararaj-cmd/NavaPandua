
from django.db import models
from apps.core.models import BaseModel
from django.contrib.auth import get_user_model

User = get_user_model()

class LeaveType(BaseModel):
    school = models.ForeignKey('schools.School', on_delete=models.CASCADE, related_name='leave_types')
    name = models.CharField(max_length=50)  # Sick Leave, Casual Leave, etc.
    description = models.TextField(blank=True)
    is_paid = models.BooleanField(default=True)
    days_allowed = models.IntegerField(default=10) # Per year

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'leave_types'

class LeaveApplication(BaseModel):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]

    school = models.ForeignKey('schools.School', on_delete=models.CASCADE, related_name='leave_applications')
    applicant = models.ForeignKey(User, on_delete=models.CASCADE, related_name='leave_applications')
    leave_type = models.ForeignKey(LeaveType, on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_leaves')
    rejection_reason = models.TextField(blank=True)
    
    @property
    def duration(self):
        return (self.end_date - self.start_date).days + 1

    def __str__(self):
        return f"{self.applicant.get_full_name()} - {self.leave_type.name} ({self.status})"

    class Meta:
        db_table = 'leave_applications'
        ordering = ['-created_at']


class StudentAttendance(BaseModel):
    STATUS_CHOICES = [
        ('PRESENT', 'Present'),
        ('ABSENT', 'Absent'),
        ('LATE', 'Late'),
        ('HALF_DAY', 'Half Day'),
        ('EXCUSED', 'Excused'),
    ]

    school = models.ForeignKey('schools.School', on_delete=models.CASCADE, related_name='student_attendance')
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE, related_name='attendance')
    date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PRESENT')
    remarks = models.TextField(blank=True)

    class Meta:
        db_table = 'student_attendance'
        unique_together = ['student', 'date']
        verbose_name = 'Student Attendance'
        verbose_name_plural = 'Student Attendances'
        ordering = ['-date', 'student__user__first_name']
        indexes = [
            models.Index(fields=['date']),
            models.Index(fields=['school', 'date', 'status']),
        ]

    def __str__(self):
        return f"{self.student.user.first_name} - {self.date} ({self.status})"

class TeacherAttendance(BaseModel):
    STATUS_CHOICES = [
        ('PRESENT', 'Present'),
        ('ABSENT', 'Absent'),
        ('LATE', 'Late'),
        ('ON_LEAVE', 'On Leave'),
    ]

    school = models.ForeignKey('schools.School', on_delete=models.CASCADE, related_name='teacher_attendance')
    teacher = models.ForeignKey('teachers.Teacher', on_delete=models.CASCADE, related_name='attendance')
    date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PRESENT')
    remarks = models.TextField(blank=True)

    class Meta:
        db_table = 'teacher_attendance'
        unique_together = ['teacher', 'date']
        verbose_name = 'Teacher Attendance'
        verbose_name_plural = 'Teacher Attendances'
        ordering = ['-date', 'teacher__user__first_name']
        indexes = [
            models.Index(fields=['date']),
            models.Index(fields=['school', 'date', 'status']),
        ]

    def __str__(self):
        return f"{self.teacher.user.first_name} - {self.date} ({self.status})"
