
from django.db import models
from apps.core.models import BaseModel, ContactInfo

class AdmissionEnquiry(BaseModel):
    """
    Initial enquiry from a parent/student.
    """
    school = models.ForeignKey(
        'schools.School',
        on_delete=models.CASCADE,
        related_name='enquiries'
    )
    student_name = models.CharField(max_length=100)
    parent_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True)
    
    # Interested Class
    target_class = models.ForeignKey(
        'classes.Class',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    description = models.TextField(blank=True)
    
    status = models.CharField(
        max_length=50,
        choices=[
            ('NEW', 'New'),
            ('CONTACTED', 'Contacted'),
            ('VISITED', 'Visited'),
            ('APPLICATION_PURCHASED', 'Application Purchased'),
            ('CLOSED', 'Closed'),
        ],
        default='NEW'
    )
    
    follow_up_date = models.DateField(null=True, blank=True)
    assigned_to = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_enquiries'
    )

    class Meta:
        db_table = 'admission_enquiries'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student_name} - {self.phone}"


class AdmissionApplication(BaseModel):
    """
    Formal application for admission.
    """
    school = models.ForeignKey(
        'schools.School',
        on_delete=models.CASCADE,
        related_name='applications'
    )
    application_number = models.CharField(max_length=50, unique=True)
    receipt_no = models.CharField(max_length=50, blank=True, null=True)
    admission_date = models.DateField(null=True, blank=True)
    
    # Student Details
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10)
    place_of_birth = models.CharField(max_length=100, blank=True)
    mother_tongue = models.CharField(max_length=50, blank=True)
    nationality = models.CharField(max_length=50, default='Indian')
    religion = models.CharField(max_length=50, blank=True)
    caste = models.CharField(max_length=20, blank=True)
    blood_group = models.CharField(max_length=5, blank=True)
    
    # Parent Details - Father
    father_name = models.CharField(max_length=100)
    father_phone = models.CharField(max_length=20)
    father_email = models.EmailField(blank=True)
    father_qualification = models.CharField(max_length=100, blank=True)
    father_college = models.CharField(max_length=200, blank=True)
    father_occupation_type = models.CharField(max_length=50, blank=True) # Govt, Pvt, etc.
    father_occupation = models.CharField(max_length=100, blank=True)
    father_organisation = models.CharField(max_length=200, blank=True)
    father_designation = models.CharField(max_length=100, blank=True)
    father_income = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    father_office_address = models.TextField(blank=True)
    
    # Parent Details - Mother
    mother_name = models.CharField(max_length=100)
    mother_phone = models.CharField(max_length=20)
    mother_email = models.EmailField(blank=True)
    mother_qualification = models.CharField(max_length=100, blank=True)
    mother_college = models.CharField(max_length=200, blank=True)
    mother_associated_with = models.TextField(blank=True) # JSON or comma separated
    
    address = models.TextField()
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    
    primary_contact_person = models.CharField(max_length=100, blank=True)
    primary_contact_phone = models.CharField(max_length=20, blank=True)
    relationship_with_student = models.CharField(max_length=50, blank=True)
    
    # Academic Details
    target_class = models.ForeignKey(
        'classes.Class',
        on_delete=models.PROTECT,
        related_name='student_applications'
    )
    previous_school_name = models.CharField(max_length=200, blank=True)
    previous_school_address = models.TextField(blank=True)
    previous_school_city = models.CharField(max_length=100, blank=True)
    previous_school_state = models.CharField(max_length=100, blank=True)
    previous_school_country = models.CharField(max_length=100, blank=True)
    previous_school_pincode = models.CharField(max_length=20, blank=True)
    previous_school_principle_name = models.CharField(max_length=100, blank=True)
    previous_school_board = models.CharField(max_length=100, blank=True)
    previous_school_class = models.CharField(max_length=50, blank=True)
    previous_school_medium = models.CharField(max_length=50, blank=True)
    
    # Other
    is_single_parent = models.BooleanField(default=False)
    legal_guardian = models.CharField(max_length=100, blank=True)
    is_guardian_father = models.BooleanField(default=False)
    is_guardian_mother = models.BooleanField(default=False)
    
    category = models.CharField(max_length=20, default='GENERAL') # General, Staff
    staff_name = models.CharField(max_length=100, blank=True)
    staff_id = models.CharField(max_length=50, blank=True)
    
    second_language = models.CharField(max_length=50, blank=True)
    third_language = models.CharField(max_length=50, blank=True)
    
    # Academic Performance JSON
    academic_performance = models.TextField(blank=True) 
    
    # Photos
    photo = models.ImageField(upload_to='admissions/photos/', null=True, blank=True)
    father_photo = models.ImageField(upload_to='admissions/fathers/', null=True, blank=True)
    mother_photo = models.ImageField(upload_to='admissions/mothers/', null=True, blank=True)
    
    # Status
    status = models.CharField(
        max_length=50,
        choices=[
            ('SUBMITTED', 'Submitted'),
            ('UNDER_REVIEW', 'Under Review'),
            ('INTERVIEW_SCHEDULED', 'Interview Scheduled'),
            ('SELECTED', 'Selected'),
            ('REJECTED', 'Rejected'),
            ('ADMITTED', 'Admitted'),
        ],
        default='SUBMITTED'
    )
    
    # Linked objects
    enquiry = models.ForeignKey(
        AdmissionEnquiry,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='application'
    )
    
    # Usually admission fees
    application_fee_paid = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'admission_applications'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.application_number} - {self.first_name} {self.last_name}"
