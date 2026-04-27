
from django.db import models
from apps.core.models import BaseModel

class FeeGroup(BaseModel):
    school = models.ForeignKey('schools.School', on_delete=models.CASCADE, related_name='fee_groups')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'fee_groups'

class FeeType(BaseModel):
    school = models.ForeignKey('schools.School', on_delete=models.CASCADE, related_name='fee_types')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'fee_types'

class FeeMaster(BaseModel):
    school = models.ForeignKey('schools.School', on_delete=models.CASCADE, related_name='fee_masters')
    fee_group = models.ForeignKey(FeeGroup, on_delete=models.CASCADE, related_name='masters')
    fee_type = models.ForeignKey(FeeType, on_delete=models.CASCADE, related_name='masters')
    
    # Target Class (optional - if null, it's a general fee)
    target_class = models.ForeignKey(
        'classes.Class', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='fee_masters'
    )
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField()
    fine_type = models.CharField(max_length=20, choices=[('NONE', 'None'), ('FIXED', 'Fixed Amount'), ('PERCENTAGE', 'Percentage')], default='NONE')
    fine_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        class_name = self.target_class.name if self.target_class else "Global"
        return f"{class_name} - {self.fee_group.name} - {self.fee_type.name} ({self.amount})"

    class Meta:
        db_table = 'fee_masters'

class FeeAllocation(BaseModel):
    STATUS_CHOICES = [
        ('UNPAID', 'Unpaid'),
        ('PARTIAL', 'Partial'),
        ('PAID', 'Paid'),
    ]
    school = models.ForeignKey('schools.School', on_delete=models.CASCADE, related_name='fee_allocations')
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE, related_name='fee_allocations', null=True, blank=True)
    application = models.ForeignKey('admissions.AdmissionApplication', on_delete=models.CASCADE, related_name='fee_allocations', null=True, blank=True)
    fee_master = models.ForeignKey(FeeMaster, on_delete=models.CASCADE, related_name='allocations')
    due_date = models.DateField(null=True, blank=True) # Override master due date if needed
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='UNPAID')

    @property
    def remaining_amount(self):
        return self.amount - self.paid_amount

    def __str__(self):
        name = self.student.first_name if self.student else (self.application.first_name if self.application else "Unknown")
        return f"{name} - {self.fee_master.fee_type.name}"

    class Meta:
        db_table = 'fee_allocations'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['due_date']),
            models.Index(fields=['school', 'status']),
        ]

class FeePayment(BaseModel):
    PAYMENT_MODE_CHOICES = [
        ('CASH', 'Cash'),
        ('BANK_TRANSFER', 'Bank Transfer'),
        ('CHEQUE', 'Cheque'),
        ('ONLINE', 'Online'),
    ]
    school = models.ForeignKey('schools.School', on_delete=models.CASCADE, related_name='fee_payments')
    allocation = models.ForeignKey(FeeAllocation, on_delete=models.CASCADE, related_name='payments')
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateField(auto_now_add=True)
    payment_mode = models.CharField(max_length=20, choices=PAYMENT_MODE_CHOICES, default='CASH')
    reference_number = models.CharField(max_length=100, blank=True)
    transaction_id = models.CharField(max_length=100, blank=True, help_text="Payment Gateway Transaction ID")
    gateway_metadata = models.JSONField(default=dict, blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Payment of {self.amount_paid} for {self.allocation.student.first_name}"

    class Meta:
        db_table = 'fee_payments'
        indexes = [
            models.Index(fields=['payment_date']),
            models.Index(fields=['school', 'payment_date']),
        ]
