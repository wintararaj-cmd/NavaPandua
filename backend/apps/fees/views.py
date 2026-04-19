
from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import FeeGroup, FeeType, FeeMaster, FeeAllocation, FeePayment
from .serializers import (
    FeeGroupSerializer, FeeTypeSerializer, FeeMasterSerializer,
    FeeAllocationSerializer, FeePaymentSerializer
)
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from .services import PaymentGateway
import uuid

class FeeBaseViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()
        if not user.is_authenticated:
            return queryset.none()
        if user.role in ['SCHOOL_ADMIN', 'TEACHER'] and user.school:
            queryset = queryset.filter(school=user.school)
        return queryset

    def perform_create(self, serializer):
        if self.request.user.school:
            serializer.save(school=self.request.user.school)
        else:
            serializer.save()

class FeeGroupViewSet(FeeBaseViewSet):
    queryset = FeeGroup.objects.all()
    serializer_class = FeeGroupSerializer
    search_fields = ['name']

class FeeTypeViewSet(FeeBaseViewSet):
    queryset = FeeType.objects.all()
    serializer_class = FeeTypeSerializer
    search_fields = ['name']

class FeeMasterViewSet(FeeBaseViewSet):
    queryset = FeeMaster.objects.all()
    serializer_class = FeeMasterSerializer
    filterset_fields = ['fee_group', 'fee_type']

class FeeAllocationViewSet(FeeBaseViewSet):
    queryset = FeeAllocation.objects.all()
    serializer_class = FeeAllocationSerializer
    filterset_fields = ['student', 'status', 'fee_master']
    search_fields = ['student__first_name', 'student__last_name']

    @action(detail=False, methods=['get'], url_path='my-allocations')
    def my_allocations(self, request):
        user = request.user
        if user.role == 'STUDENT':
            student = user.student_profile
            allocations = self.get_queryset().filter(student=student)
            serializer = self.get_serializer(allocations, many=True)
            return Response(serializer.data)
        return Response({'error': 'User is not a student'}, status=status.HTTP_403_FORBIDDEN)


    @action(detail=True, methods=['post'], url_path='pay')
    def initiate_payment(self, request, pk=None):
        allocation = self.get_object()
        
        # Check if already paid
        if allocation.status == 'PAID':
            return Response(
                {"error": "Fee already paid fully"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        amount = request.data.get('amount')
        if not amount:
            amount = allocation.remaining_amount
        else:
            amount = float(amount)
            if amount > allocation.remaining_amount:
                return Response(
                    {"error": f"Amount exceeds remaining balance of {allocation.remaining_amount}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        gateway = PaymentGateway()
        try:
            order = gateway.create_order(
                amount=amount, 
                receipt=str(allocation.id),
                notes={
                    'student_name': str(allocation.student.user.get_full_name()),
                    'fee_type': allocation.fee_master.fee_type.name,
                    'allocation_id': str(allocation.id)
                }
            )
            return Response(order)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], url_path='verify-payment')
    def verify_payment(self, request, pk=None):
        allocation = self.get_object()
        
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_signature = request.data.get('razorpay_signature')
        amount_paid = request.data.get('amount_paid') # Optional, usually derived from order

        if not all([razorpay_payment_id, razorpay_order_id, razorpay_signature]):
             return Response({"error": "Missing payment details"}, status=status.HTTP_400_BAD_REQUEST)

        gateway = PaymentGateway()
        if gateway.verify_payment(razorpay_order_id, razorpay_payment_id, razorpay_signature):
             # Success! Create FeePayment and Update Allocation
             try:
                 with transaction.atomic():
                     # 1. Create Payment Record
                     payment = FeePayment.objects.create(
                         school=allocation.school,
                         allocation=allocation,
                         amount_paid=amount_paid if amount_paid else 0, # Should ideally verify amount from order
                         payment_mode='ONLINE',
                         transaction_id=razorpay_payment_id,
                         gateway_metadata={
                             'order_id': razorpay_order_id,
                             'signature': razorpay_signature
                         },
                         notes=f"Online payment via Razorpay. Order: {razorpay_order_id}"
                     )
                     
                     # 2. Update Allocation
                     allocation.paid_amount += payment.amount_paid
                     if allocation.remaining_amount <= 0:
                         allocation.status = 'PAID'
                     else:
                         allocation.status = 'PARTIAL'
                     allocation.save()
                     
                     return Response(FeePaymentSerializer(payment).data, status=status.HTTP_201_CREATED)
             except Exception as e:
                 return Response({"error": f"Database error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response({"error": "Signature verification failed"}, status=status.HTTP_400_BAD_REQUEST)

class FeePaymentViewSet(FeeBaseViewSet):
    queryset = FeePayment.objects.all()
    serializer_class = FeePaymentSerializer
    filterset_fields = ['allocation', 'payment_mode']
