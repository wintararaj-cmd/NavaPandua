"""
School models.
"""

from django.db import models
from apps.core.models import BaseModel, ContactInfo


class School(BaseModel, ContactInfo):
    """
    School model for managing individual schools within an organization.
    """
    
    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='schools'
    )
    
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    
    INSTITUTION_TYPES = [
        ('K12_SCHOOL', 'K-12 School'),
        ('TRAINING_CENTER', 'Computer/Training Center'),
        ('INSTITUTE', 'Institute'),
        ('COLLEGE', 'College/University'),
    ]
    institution_type = models.CharField(
        max_length=20,
        choices=INSTITUTION_TYPES,
        default='K12_SCHOOL'
    )
    
    logo = models.ImageField(upload_to='schools/logos/', null=True, blank=True)
    website = models.URLField(blank=True)
    
    # Extended Details from ERP
    slogan = models.CharField(max_length=255, blank=True)
    udise_number = models.CharField(max_length=50, blank=True)
    zone = models.CharField(max_length=100, blank=True)
    funded_by = models.CharField(max_length=100, blank=True)
    approved_by_authority = models.CharField(max_length=255, blank=True)
    registration_number = models.CharField(max_length=100, blank=True)
    geo_location = models.CharField(max_length=255, blank=True)
    about = models.TextField(blank=True)
    society = models.CharField(max_length=255, blank=True)
    parent_organization = models.CharField(max_length=255, blank=True)

    
    # Address
    address_line1 = models.CharField(max_length=255)
    address_line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100, default='India')
    postal_code = models.CharField(max_length=20)
    
    # School Information
    established_year = models.IntegerField(null=True, blank=True)
    affiliation = models.CharField(max_length=255, blank=True)
    board = models.CharField(
        max_length=50,
        choices=[
            ('CBSE', 'CBSE'),
            ('ICSE', 'ICSE'),
            ('STATE', 'State Board'),
            ('IB', 'International Baccalaureate'),
            ('IGCSE', 'IGCSE'),
        ],
        blank=True
    )
    
    # Principal/Head
    principal_name = models.CharField(max_length=200, blank=True)
    principal_email = models.EmailField(blank=True)
    principal_phone = models.CharField(max_length=20, blank=True)

    # Chairman/Owner
    chairman_name = models.CharField(max_length=200, blank=True)
    chairman_email = models.EmailField(blank=True)
    chairman_phone = models.CharField(max_length=20, blank=True)
    
    # Settings
    is_active = models.BooleanField(default=True)
    current_academic_year = models.CharField(max_length=20, blank=True)
    
    class Meta:
        db_table = 'schools'
        verbose_name = 'School'
        verbose_name_plural = 'Schools'
        ordering = ['-created_at']
        unique_together = [['organization', 'code']]
    
    def __str__(self):
        return f"{self.name} ({self.code})"
    
    def get_full_address(self):
        """Return formatted full address."""
        parts = [
            self.address_line1,
            self.address_line2,
            self.city,
            self.state,
            self.country,
            self.postal_code
        ]
        return ', '.join(filter(None, parts))
    
    @property
    def total_students(self):
        """Get total number of students."""
        from apps.students.models import Student
        return Student.objects.filter(school=self, is_deleted=False).count()
    
    @property
    def total_teachers(self):
        """Get total number of teachers."""
        from apps.teachers.models import Teacher
        return Teacher.objects.filter(school=self, is_deleted=False).count()
    
    @property
    def total_classes(self):
        """Get total number of classes."""
        from apps.classes.models import Class
        return Class.objects.filter(school=self, is_deleted=False).count()


class SchoolSettings(BaseModel):
    """
    School-level settings and configurations.
    """
    
    school = models.OneToOneField(
        School,
        on_delete=models.CASCADE,
        related_name='settings'
    )
    
    # Academic Settings
    academic_year_start_month = models.IntegerField(default=4)  # April
    academic_year_end_month = models.IntegerField(default=3)  # March
    terms_per_year = models.IntegerField(default=2)
    working_days_per_week = models.IntegerField(default=6)
    
    # Time Settings
    school_start_time = models.TimeField(null=True, blank=True)
    school_end_time = models.TimeField(null=True, blank=True)
    period_duration_minutes = models.IntegerField(default=40)
    break_duration_minutes = models.IntegerField(default=15)
    
    # Grading System
    grading_system = models.CharField(
        max_length=20,
        choices=[
            ('PERCENTAGE', 'Percentage'),
            ('GPA', 'GPA (4.0)'),
            ('CGPA', 'CGPA (10.0)'),
            ('LETTER', 'Letter Grade'),
        ],
        default='PERCENTAGE'
    )
    passing_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=40.00
    )
    
    # Fee Settings
    late_fee_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=2.00
    )
    late_fee_grace_days = models.IntegerField(default=7)
    
    # Attendance Settings
    minimum_attendance_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=75.00
    )
    
    # Notification Settings
    send_daily_attendance_sms = models.BooleanField(default=False)
    send_fee_reminder_sms = models.BooleanField(default=False)
    send_exam_result_sms = models.BooleanField(default=False)
    
    # ID Card Settings
    student_id_prefix = models.CharField(max_length=10, default='STU')
    teacher_id_prefix = models.CharField(max_length=10, default='TCH')
    id_number_length = models.IntegerField(default=6)
    
    # ERP Specific Settings
    policy_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    school_renewal_date = models.DateField(null=True, blank=True)
    
    class Meta:
        db_table = 'school_settings'
        verbose_name = 'School Settings'
        verbose_name_plural = 'School Settings'
    
    def __str__(self):
        return f"Settings for {self.school.name}"


class AcademicYear(BaseModel):
    """
    Academic year configuration for a school.
    """
    
    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name='academic_years'
    )
    
    name = models.CharField(max_length=20)  # e.g., "2024-2025"
    start_date = models.DateField()
    end_date = models.DateField()
    is_current = models.BooleanField(default=False)
    
    # Session Controls
    is_closed_for_admission = models.BooleanField(default=False)
    is_closed_for_advance = models.BooleanField(default=False)
    is_closed_for_working = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'academic_years'
        verbose_name = 'Academic Year'
        verbose_name_plural = 'Academic Years'
        ordering = ['-start_date']
        unique_together = [['school', 'name']]
    
    def __str__(self):
        return f"{self.school.name} - {self.name}"
    
    def save(self, *args, **kwargs):
        """Ensure only one current academic year per school."""
        if self.is_current:
            AcademicYear.objects.filter(
                school=self.school,
                is_current=True
            ).exclude(id=self.id).update(is_current=False)
        super().save(*args, **kwargs)


class Holiday(BaseModel):
    """
    Holiday calendar for a school.
    """
    
    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name='holidays'
    )
    academic_year = models.ForeignKey(
        AcademicYear,
        on_delete=models.CASCADE,
        related_name='holidays',
        null=True,
        blank=True
    )
    
    name = models.CharField(max_length=200)
    date = models.DateField()
    end_date = models.DateField(null=True, blank=True)  # For multi-day holidays
    description = models.TextField(blank=True)
    
    class Meta:
        db_table = 'holidays'
        verbose_name = 'Holiday'
        verbose_name_plural = 'Holidays'
        ordering = ['date']
    
    def __str__(self):
        return f"{self.name} - {self.date}"
    
    @property
    def is_multi_day(self):
        """Check if holiday spans multiple days."""
        return self.end_date is not None and self.end_date > self.date


class MasterData(BaseModel):
    """
    Dynamic master data for dropdowns and classifications.
    Handles Class, ClassSection, ClassGroup, Transport Type, etc.
    """
    
    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name='master_data'
    )
    
    domain = models.CharField(max_length=100)  # e.g., 'Class', 'Fee Category'
    identifier = models.CharField(max_length=100)  # e.g., 'ClassSection'
    description = models.CharField(max_length=255)  # e.g., 'A', 'Play', 'LKG'
    
    class Meta:
        db_table = 'master_data'
        verbose_name = 'Master Data'
        verbose_name_plural = 'Master Data'
        ordering = ['domain', 'description']
        unique_together = [['school', 'domain', 'identifier', 'description']]
    
    def __str__(self):
        return f"{self.domain}: {self.description}"
