
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
    
    # Student Details
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    gender = models.CharField(
        max_length=10,
        choices=[
            ('MALE', 'Male'),
            ('FEMALE', 'Female'),
            ('OTHER', 'Other')
        ]
    )
    
    # Parent Details
    father_name = models.CharField(max_length=100)
    mother_name = models.CharField(max_length=100)
    parent_phone = models.CharField(max_length=20)
    parent_email = models.EmailField(blank=True)
    address = models.TextField()
    
    # Academic Details
    target_class = models.ForeignKey(
        'classes.Class',
        on_delete=models.PROTECT,
        related_name='student_applications'
    )
    previous_school = models.CharField(max_length=200, blank=True)
    previous_grade = models.CharField(max_length=50, blank=True)
    
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
