"""
Organization models for multi-tenant management.
"""

from django.db import models
from apps.core.models import BaseModel, ContactInfo


class Organization(BaseModel, ContactInfo):
    """
    Organization model for multi-tenant architecture.
    Each organization can have multiple schools.
    """
    
    name = models.CharField(max_length=255, unique=True)
    subdomain = models.SlugField(max_length=100, unique=True)
    logo = models.ImageField(upload_to='organizations/logos/', null=True, blank=True)
    website = models.URLField(blank=True)
    
    # Address
    address_line1 = models.CharField(max_length=255)
    address_line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100, default='India')
    postal_code = models.CharField(max_length=20)
    
    # Settings
    is_active = models.BooleanField(default=True)
    
    # Internal Enterprise - No limits
    max_schools = models.IntegerField(default=999)
    max_students = models.IntegerField(default=999999)
    max_teachers = models.IntegerField(default=9999)
    
    # Owner
    owner = models.ForeignKey(
        'accounts.User',
        on_delete=models.PROTECT,
        related_name='owned_organizations'
    )
    
    class Meta:
        db_table = 'organizations'
        verbose_name = 'Organization'
        verbose_name_plural = 'Organizations'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
    
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
    def total_schools(self):
        """Get total number of schools."""
        return self.schools.filter(is_deleted=False).count()
    
    @property
    def total_students(self):
        """Get total number of students across all schools."""
        from apps.students.models import Student
        return Student.objects.filter(
            school__organization=self,
            is_deleted=False
        ).count()
    
    @property
    def total_teachers(self):
        """Get total number of teachers across all schools."""
        from apps.teachers.models import Teacher
        return Teacher.objects.filter(
            school__organization=self,
            is_deleted=False
        ).count()
    


class OrganizationSettings(BaseModel):
    """
    Organization-level settings and configurations.
    """
    
    organization = models.OneToOneField(
        Organization,
        on_delete=models.CASCADE,
        related_name='settings'
    )
    
    # Email Configuration
    email_provider = models.CharField(
        max_length=50,
        choices=[
            ('SMTP', 'SMTP'),
            ('SENDGRID', 'SendGrid'),
            ('MAILGUN', 'Mailgun'),
            ('SES', 'Amazon SES'),
        ],
        default='SMTP'
    )
    email_from_name = models.CharField(max_length=255, blank=True)
    email_from_address = models.EmailField(blank=True)
    smtp_host = models.CharField(max_length=255, blank=True)
    smtp_port = models.IntegerField(null=True, blank=True)
    smtp_username = models.CharField(max_length=255, blank=True)
    smtp_password = models.CharField(max_length=255, blank=True)
    smtp_use_tls = models.BooleanField(default=True)
    
    # SMS Configuration
    sms_provider = models.CharField(
        max_length=50,
        choices=[
            ('TWILIO', 'Twilio'),
            ('MSG91', 'MSG91'),
            ('AWS_SNS', 'AWS SNS'),
        ],
        blank=True
    )
    sms_api_key = models.CharField(max_length=255, blank=True)
    sms_api_secret = models.CharField(max_length=255, blank=True)
    sms_sender_id = models.CharField(max_length=50, blank=True)
    
    # Payment Gateway Configuration
    payment_gateway = models.CharField(
        max_length=50,
        choices=[
            ('RAZORPAY', 'Razorpay'),
            ('STRIPE', 'Stripe'),
            ('PAYTM', 'Paytm'),
            ('PAYPAL', 'PayPal'),
        ],
        blank=True
    )
    payment_api_key = models.CharField(max_length=255, blank=True)
    payment_api_secret = models.CharField(max_length=255, blank=True)
    payment_webhook_secret = models.CharField(max_length=255, blank=True)
    
    # Academic Settings
    default_academic_year = models.CharField(max_length=20, blank=True)
    default_currency = models.CharField(max_length=10, default='INR')
    default_timezone = models.CharField(max_length=50, default='Asia/Kolkata')
    default_language = models.CharField(max_length=10, default='en')
    
    # Feature Flags
    enable_online_admission = models.BooleanField(default=True)
    enable_online_payment = models.BooleanField(default=True)
    enable_sms_notifications = models.BooleanField(default=False)
    enable_email_notifications = models.BooleanField(default=True)
    enable_live_classes = models.BooleanField(default=False)
    enable_mobile_app = models.BooleanField(default=False)
    
    # Branding
    primary_color = models.CharField(max_length=7, default='#6366F1')
    secondary_color = models.CharField(max_length=7, default='#8B5CF6')
    custom_css = models.TextField(blank=True)
    
    class Meta:
        db_table = 'organization_settings'
        verbose_name = 'Organization Settings'
        verbose_name_plural = 'Organization Settings'
    
    def __str__(self):
        return f"Settings for {self.organization.name}"


class OrganizationInvitation(BaseModel):
    """
    Invitations to join an organization.
    """
    
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='invitations'
    )
    email = models.EmailField()
    role = models.CharField(max_length=20)
    invited_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='sent_invitations'
    )
    token = models.CharField(max_length=255, unique=True)
    expires_at = models.DateTimeField()
    is_accepted = models.BooleanField(default=False)
    accepted_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'organization_invitations'
        verbose_name = 'Organization Invitation'
        verbose_name_plural = 'Organization Invitations'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Invitation to {self.email} for {self.organization.name}"
