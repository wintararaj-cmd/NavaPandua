import razorpay
from django.conf import settings
from rest_framework.exceptions import ValidationError

class PaymentGateway:
    def __init__(self):
        self.client = None
        if hasattr(settings, 'RAZORPAY_KEY_ID') and hasattr(settings, 'RAZORPAY_KEY_SECRET'):
            self.client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

    def create_order(self, amount, currency='INR', receipt=None, notes=None):
        if not self.client:
            # Mock response for development if keys are missing
            import uuid
            return {
                'id': f'order_{uuid.uuid4().hex[:10]}',
                'entity': 'order',
                'amount': int(amount * 100),
                'amount_paid': 0,
                'amount_due': int(amount * 100),
                'currency': currency,
                'receipt': receipt,
                'status': 'created',
                'attempts': 0,
                'notes': notes or {},
                'created_at': 1234567890
            }

        data = {
            'amount': int(amount * 100),  # Amount in paise
            'currency': currency,
            'receipt': receipt,
            'notes': notes or {}
        }
        try:
            return self.client.order.create(data=data)
        except Exception as e:
            raise ValidationError(f"Error creating Razorpay order: {str(e)}")

    def verify_payment(self, razorpay_order_id, razorpay_payment_id, razorpay_signature):
        if not self.client:
            # Always return True for mock dev
            return True

        try:
            return self.client.utility.verify_payment_signature({
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            })
        except Exception:
            return False

class FeeAllocationService:
    @staticmethod
    def allocate_to_class(fee_master, target_class=None, target_class_id=None):
        """
        Allocates a fee to all students in a class or the master's target class.
        """
        from apps.students.models import Student
        from apps.classes.models import Class
        from .models import FeeAllocation
        from django.db import transaction

        if target_class_id:
            try:
                cls = Class.objects.get(id=target_class_id)
            except Class.DoesNotExist:
                raise ValidationError(f"Class with ID {target_class_id} not found.")
        else:
            cls = target_class or fee_master.target_class
            
        if not cls:
            raise ValidationError("A class must be specified for allocation.")

        students = Student.objects.filter(current_class=cls, status='ACTIVE', school=fee_master.school)
        
        count = 0
        with transaction.atomic():
            for student in students:
                # Avoid duplicate allocation
                if not FeeAllocation.objects.filter(student=student, fee_master=fee_master).exists():
                    FeeAllocation.objects.create(
                        school=fee_master.school,
                        student=student,
                        fee_master=fee_master,
                        amount=fee_master.amount,
                        due_date=fee_master.due_date,
                        status='UNPAID'
                    )
                    count += 1
        return count
