
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
    middle_name = models.CharField(max_length=150, blank=True)
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
    
    # Basic Info
    place_of_birth = models.CharField(max_length=100, blank=True)
    mother_tongue = models.CharField(max_length=50, blank=True)
    nationality = models.CharField(max_length=50, default='Indian')
    religion = models.CharField(max_length=50, blank=True)
    caste = models.CharField(
        max_length=20, 
        choices=[('SC', 'SC'), ('ST', 'ST'), ('OBC', 'OBC'), ('GENERAL', 'General')],
        blank=True
    )
    blood_group = models.CharField(max_length=5, blank=True)
    
    # Previous School Info
    previous_school_name = models.CharField(max_length=255, blank=True)
    previous_school_address = models.TextField(blank=True)
    previous_school_city = models.CharField(max_length=100, blank=True)
    previous_school_state = models.CharField(max_length=100, blank=True)
    previous_school_country = models.CharField(max_length=100, blank=True)
    previous_school_pincode = models.CharField(max_length=20, blank=True)
    previous_school_principle_name = models.CharField(max_length=100, blank=True)
    previous_school_class = models.CharField(max_length=50, blank=True)
    previous_school_board = models.CharField(max_length=100, blank=True)
    previous_school_medium = models.CharField(max_length=50, blank=True)
    
    # Family Info - Father
    father_name = models.CharField(max_length=100)
    father_phone = models.CharField(max_length=20, blank=True)
    father_email = models.EmailField(blank=True)
    father_qualification = models.CharField(max_length=100, blank=True)
    father_college = models.CharField(max_length=255, blank=True)
    father_occupation = models.CharField(max_length=100, blank=True)
    father_organisation = models.CharField(max_length=255, blank=True)
    father_designation = models.CharField(max_length=100, blank=True)
    father_income = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    father_office_address = models.TextField(blank=True)
    father_occupation_type = models.CharField(max_length=50, blank=True)
    
    # Family Info - Mother
    mother_name = models.CharField(max_length=100)
    mother_phone = models.CharField(max_length=20, blank=True)
    mother_email = models.EmailField(blank=True)
    mother_qualification = models.CharField(max_length=100, blank=True)
    mother_college = models.CharField(max_length=255, blank=True)
    mother_associated_with = models.TextField(blank=True)
    
    # Address Info
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, default='India')

    
    # Other Info
    is_single_parent = models.BooleanField(default=False)
    legal_guardian = models.CharField(max_length=100, blank=True)
    is_guardian_father = models.BooleanField(default=False)
    is_guardian_mother = models.BooleanField(default=False)
    
    category = models.CharField(max_length=20, default='GENERAL')
    staff_name = models.CharField(max_length=100, blank=True)
    staff_id = models.CharField(max_length=50, blank=True)
    
    primary_contact_person = models.CharField(max_length=100, blank=True)
    primary_contact_phone = models.CharField(max_length=20, blank=True)
    relationship_with_student = models.CharField(max_length=50, blank=True)
    
    second_language = models.CharField(max_length=50, blank=True)
    third_language = models.CharField(max_length=50, blank=True)
    
    academic_performance = models.TextField(blank=True)
    
    # Photos
    photo = models.ImageField(upload_to='students/photos/', null=True, blank=True)
    father_photo = models.ImageField(upload_to='students/fathers/', null=True, blank=True)
    mother_photo = models.ImageField(upload_to='students/mothers/', null=True, blank=True)
    
    # Categorization & ERP Info
    fee_category = models.CharField(max_length=50, blank=True)
    house = models.CharField(max_length=50, blank=True)
    transport_type = models.CharField(max_length=50, blank=True)
    fee_payment_mode = models.CharField(max_length=50, blank=True)
    
    STUDENT_STATUS = [
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        ('LEFT', 'Left/SLC Generated'),
        ('GRADUATED', 'Graduated'),
    ]
    status = models.CharField(max_length=20, choices=STUDENT_STATUS, default='ACTIVE')
    
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
class StudentPromotionHistory(BaseModel):
    """Track history of student class promotions."""
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='promotion_history')
    from_session = models.ForeignKey('schools.AcademicYear', related_name='promotions_from', on_delete=models.CASCADE)
    to_session = models.ForeignKey('schools.AcademicYear', related_name='promotions_to', on_delete=models.CASCADE)
    from_class = models.ForeignKey('classes.Class', related_name='promotions_from', on_delete=models.CASCADE)
    to_class = models.ForeignKey('classes.Class', related_name='promotions_to', on_delete=models.CASCADE)
    promoted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    date_promoted = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=[('PROMOTED', 'Promoted'), ('RETAINED', 'Retained')], default='PROMOTED')
    
    class Meta:
        db_table = 'student_promotions'

    def __str__(self):
        return f"{self.student.user.first_name} - {self.from_class} to {self.to_class}"

class SchoolLeavingCertificate(BaseModel):
    """Generate and track School Leaving Certificates (SLC)."""
    student = models.OneToOneField(Student, on_delete=models.CASCADE, related_name='slc')
    school = models.ForeignKey('schools.School', on_delete=models.CASCADE, related_name='slcs')
    academic_session = models.ForeignKey('schools.AcademicYear', on_delete=models.CASCADE)
    slc_number = models.CharField(max_length=50, unique=True)
    issue_date = models.DateField()
    reason_for_leaving = models.CharField(max_length=255)
    conduct = models.CharField(max_length=50, default='Good')
    remarks = models.TextField(blank=True)
    generated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    
    class Meta:
        db_table = 'school_leaving_certificates'
        ordering = ['-issue_date']

    def __str__(self):
        return f"SLC: {self.slc_number} - {self.student.user.first_name}"

class StudentSibling(BaseModel):
    """Track siblings of a student within the school."""
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='siblings')
    name = models.CharField(max_length=200)
    class_name = models.CharField(max_length=50, blank=True)
    section = models.CharField(max_length=20, blank=True)
    roll = models.CharField(max_length=20, blank=True)
    registration_number = models.CharField(max_length=50, blank=True)
    
    class Meta:
        db_table = 'student_siblings'

    def __str__(self):
        return f"Sibling of {self.student.user.first_name}: {self.name}"
