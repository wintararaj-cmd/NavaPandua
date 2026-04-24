"""
User and authentication models.
"""

from django.contrib.auth.models import AbstractUser
from django.db import models
from apps.core.models import BaseModel, ContactInfo


class User(AbstractUser):
    """
    Custom user model with role-based authentication.
    """
    class UserRole(models.TextChoices):
        SUPER_ADMIN = 'SUPER_ADMIN', 'Super Admin'
        SCHOOL_ADMIN = 'SCHOOL_ADMIN', 'School Admin'
        TEACHER = 'TEACHER', 'Teacher'
        STUDENT = 'STUDENT', 'Student'
        PARENT = 'PARENT', 'Parent'
        ACCOUNTANT = 'ACCOUNTANT', 'Accountant'
        LIBRARIAN = 'LIBRARIAN', 'Librarian'
        RECEPTIONIST = 'RECEPTIONIST', 'Receptionist'
        DRIVER = 'DRIVER', 'Driver'
        TRANSPORT_MANAGER = 'TRANSPORT_MANAGER', 'Transport Manager'
        HR = 'HR', 'HR Manager'

    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.STUDENT
    )
    is_email_verified = models.BooleanField(default=False)
    is_phone_verified = models.BooleanField(default=False)
    profile_picture = models.ImageField(
        upload_to='profile_pictures/',
        null=True,
        blank=True
    )
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(
        max_length=10,
        choices=[
            ('MALE', 'Male'),
            ('FEMALE', 'Female'),
            ('OTHER', 'Other')
        ],
        blank=True
    )
    
    # Organization/School relationship
    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='users',
        null=True,
        blank=True
    )
    school = models.ForeignKey(
        'schools.School',
        on_delete=models.CASCADE,
        related_name='users',
        null=True,
        blank=True
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-date_joined']

    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"

    def get_full_name(self):
        """Return full name or username if name not set."""
        full_name = super().get_full_name()
        return full_name if full_name else self.username

    @property
    def is_super_admin(self):
        return self.role == self.UserRole.SUPER_ADMIN

    @property
    def is_school_admin(self):
        return self.role == self.UserRole.SCHOOL_ADMIN

    @property
    def is_teacher(self):
        return self.role == self.UserRole.TEACHER

    @property
    def is_student(self):
        return self.role == self.UserRole.STUDENT

    @property
    def is_parent(self):
        return self.role == self.UserRole.PARENT


class UserProfile(BaseModel, ContactInfo):
    """
    Extended user profile information.
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    bio = models.TextField(blank=True)
    address_line1 = models.CharField(max_length=255, blank=True)
    address_line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, default='India')
    postal_code = models.CharField(max_length=20, blank=True)
    
    # Emergency contact
    emergency_contact_name = models.CharField(max_length=200, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True)
    emergency_contact_relation = models.CharField(max_length=100, blank=True)
    
    # Additional fields
    blood_group = models.CharField(
        max_length=5,
        choices=[
            ('A+', 'A+'), ('A-', 'A-'),
            ('B+', 'B+'), ('B-', 'B-'),
            ('AB+', 'AB+'), ('AB-', 'AB-'),
            ('O+', 'O+'), ('O-', 'O-'),
        ],
        blank=True
    )
    nationality = models.CharField(max_length=100, default='Indian')
    religion = models.CharField(max_length=100, blank=True)
    caste = models.CharField(max_length=100, blank=True)
    
    class Meta:
        db_table = 'user_profiles'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'

    def __str__(self):
        return f"Profile of {self.user.get_full_name()}"

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


class StaffProfile(BaseModel):
    """
    Staff-specific profile information for employees (Teachers, Accountants, etc.).
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='staff_profile'
    )
    school = models.ForeignKey(
        'schools.School',
        on_delete=models.CASCADE,
        related_name='staff_members',
        null=True,
        blank=True
    )
    employee_id = models.CharField(max_length=50)
    department = models.CharField(max_length=100, blank=True)
    designation = models.CharField(max_length=100, blank=True)
    qualification = models.CharField(max_length=255, blank=True)
    joining_date = models.DateField(null=True, blank=True)
    leaving_date = models.DateField(null=True, blank=True)
    
    # Financial/HR
    basic_salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    bank_account_number = models.CharField(max_length=100, blank=True)
    bank_name = models.CharField(max_length=100, blank=True)
    ifsc_code = models.CharField(max_length=20, blank=True)
    
    class Meta:
        db_table = 'staff_profiles'
        verbose_name = 'Staff Profile'
        verbose_name_plural = 'Staff Profiles'
        unique_together = [['school', 'employee_id']]

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.designation}"


class EmailVerification(BaseModel):
    """
    Email verification tokens.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=255, unique=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    class Meta:
        db_table = 'email_verifications'
        verbose_name = 'Email Verification'
        verbose_name_plural = 'Email Verifications'

    def __str__(self):
        return f"Email verification for {self.user.email}"


class PasswordReset(BaseModel):
    """
    Password reset tokens.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=255, unique=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    class Meta:
        db_table = 'password_resets'
        verbose_name = 'Password Reset'
        verbose_name_plural = 'Password Resets'

    def __str__(self):
        return f"Password reset for {self.user.email}"


class UserActivity(BaseModel):
    """
    Track user activity and login history.
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='activities'
    )
    action = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    class Meta:
        db_table = 'user_activities'
        verbose_name = 'User Activity'
        verbose_name_plural = 'User Activities'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.action}"
