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
