from django.db import models
from apps.schools.models import School

class InventoryCategory(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='inventory_categories')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.school.name})"

    class Meta:
        verbose_name_plural = "Inventory Categories"
        unique_together = ('school', 'name')

class InventoryItem(models.Model):
    UNIT_CHOICES = [
        ('PCS', 'Pieces'),
        ('BOX', 'Box'),
        ('KG', 'Kilogram'),
        ('LTR', 'Litre'),
        ('SET', 'Set'),
        ('PKT', 'Packet'),
    ]

    category = models.ForeignKey(InventoryCategory, on_delete=models.CASCADE, related_name='items')
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='inventory_items')
    name = models.CharField(max_length=200)
    item_code = models.CharField(max_length=50, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES, default='PCS')
    
    # Asset Management
    is_asset = models.BooleanField(default=True, help_text="Is this a long-term asset like furniture/IT?")
    asset_tag_prefix = models.CharField(max_length=10, blank=True, null=True)
    
    # Stock info
    reorder_level = models.IntegerField(default=5)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class InventoryStock(models.Model):
    item = models.OneToOneField(InventoryItem, on_delete=models.CASCADE, related_name='stock')
    school = models.ForeignKey(School, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.item.name}: {self.quantity}"

class InventoryIssue(models.Model):
    STATUS_CHOICES = [
        ('ISSUED', 'Issued'),
        ('RETURNED', 'Returned'),
        ('LOST', 'Lost'),
        ('DAMAGED', 'Damaged'),
    ]

    school = models.ForeignKey(School, on_delete=models.CASCADE)
    item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE)
    issued_to_staff = models.ForeignKey('teachers.Teacher', on_delete=models.SET_NULL, null=True, blank=True)
    issued_to_room = models.CharField(max_length=100, blank=True, null=True, help_text="Room or Lab name")
    
    quantity = models.IntegerField(default=1)
    issue_date = models.DateField()
    due_date = models.DateField(null=True, blank=True)
    return_date = models.DateField(null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ISSUED')
    remarks = models.TextField(blank=True, null=True)
    
    issued_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.item.name} issued to {self.issued_to_staff or self.issued_to_room}"

class InventoryTransaction(models.Model):
    TRANSACTION_TYPES = [
        ('PURCHASE', 'Purchase / Addition'),
        ('ISSUE', 'Issue'),
        ('RETURN', 'Return'),
        ('ADJUSTMENT', 'Stock Adjustment'),
        ('DISCARD', 'Discard / Scrap'),
    ]

    school = models.ForeignKey(School, on_delete=models.CASCADE)
    item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    quantity = models.IntegerField()  # Positive for addition, negative for removal
    
    reference_id = models.CharField(max_length=100, blank=True, null=True, help_text="PO number or Issue ID")
    transaction_date = models.DateTimeField(auto_now_add=True)
    performed_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True)
    remarks = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.transaction_type} - {self.item.name} ({self.quantity})"
