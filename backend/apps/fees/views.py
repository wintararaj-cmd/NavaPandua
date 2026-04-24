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
from .services import PaymentGateway, FeeAllocationService
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
    filterset_fields = ['fee_group', 'fee_type', 'target_class']

    @action(detail=True, methods=['post'], url_path='bulk-allocate')
    def bulk_allocate(self, request, pk=None):
        master = self.get_object()
        class_id = request.data.get('class_id')
        
        try:
            count = FeeAllocationService.allocate_to_class(master, target_class_id=class_id)
            return Response({
                "message": f"Successfully allocated fees to {count} students.",
                "count": count
            })
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class FeeAllocationViewSet(FeeBaseViewSet):
    queryset = FeeAllocation.objects.all()
    serializer_class = FeeAllocationSerializer
    filterset_fields = ['student', 'status', 'fee_master']
    search_fields = ['student__first_name', 'student__last_name']

    @action(detail=False, methods=['get'], url_path='student-ledger')
    def student_ledger(self, request):
        student_id = request.query_params.get('student_id')
        if not student_id:
            return Response({"error": "student_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        allocations = FeeAllocation.objects.filter(student_id=student_id).select_related('fee_master__fee_type')
        payments = FeePayment.objects.filter(allocation__student_id=student_id).select_related('allocation__fee_master__fee_type')
        
        ledger = []
        for alloc in allocations:
            ledger.append({
                'date': alloc.created_at,
                'type': 'CHARGE',
                'description': alloc.fee_master.fee_type.name,
                'amount': alloc.amount,
                'balance_impact': alloc.amount
            })
        
        for pay in payments:
            ledger.append({
                'date': pay.payment_date,
                'type': 'PAYMENT',
                'description': f"Payment for {pay.allocation.fee_master.fee_type.name} via {pay.payment_mode}",
                'amount': pay.amount_paid,
                'balance_impact': -pay.amount_paid
            })
            
        ledger.sort(key=lambda x: x['date'], reverse=True)
        return Response(ledger)

    @action(detail=True, methods=['get'], url_path='upi-qr')
    def upi_qr(self, request, pk=None):
        allocation = self.get_object()
        if allocation.status == 'PAID':
            return Response({"error": "Fee already paid"}, status=status.HTTP_400_BAD_REQUEST)

        import qrcode
        from django.conf import settings
        
        vpa = getattr(settings, 'UPI_VPA', 'school@upi')
        name = allocation.school.name
        amount = allocation.remaining_amount
        note = f"Fee_{allocation.id}"
        
        # upi://pay?pa=VPA&pn=NAME&am=AMOUNT&tn=NOTE
        upi_string = f"upi://pay?pa={vpa}&pn={name.replace(' ', '%20')}&am={amount}&tn={note}"
        
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(upi_string)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)
        
        return HttpResponse(buffer, content_type='image/png')

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

    def _generate_receipt_pdf(self, payment):
        allocation = payment.allocation
        student = allocation.student
        
        buffer = io.BytesIO()
        from reportlab.lib.pagesizes import A5
        doc = SimpleDocTemplate(buffer, pagesize=A5)
        elements = []
        styles = getSampleStyleSheet()

        # Receipt Header
        elements.append(Paragraph(f"{payment.school.name}", styles['Title']))
        elements.append(Paragraph("FEE PAYMENT RECEIPT", styles['Heading2']))
        elements.append(Paragraph("<hr/>", styles['Normal']))
        
        # Data
        data = [
            ["Receipt No:", f"RCP-{payment.id}", "Date:", str(payment.payment_date)],
            ["Student Name:", student.user.get_full_name(), "ID:", student.admission_number],
            ["Class:", f"{student.current_class.name} {student.section.name}", "", ""],
            ["Fee Type:", allocation.fee_master.fee_type.name, "", ""],
            ["Payment Mode:", payment.payment_mode, "Ref:", payment.reference_number or "-"],
            ["Amount Paid:", f"INR {payment.amount_paid}", "", ""],
        ]
        
        table = Table(data, colWidths=[80, 150, 50, 100])
        table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ]))
        elements.append(table)
        
        elements.append(Paragraph("<br/><br/>", styles['Normal']))
        elements.append(Paragraph("Authorized Signatory", styles['Normal']))
        
        doc.build(elements)
        buffer.seek(0)
        return buffer

    def perform_create(self, serializer):
        with transaction.atomic():
            payment = serializer.save(school=self.request.user.school)
            
            # Update allocation status
            allocation = payment.allocation
            allocation.paid_amount += payment.amount_paid
            if allocation.remaining_amount <= 0:
                allocation.status = 'PAID'
            else:
                allocation.status = 'PARTIAL'
            allocation.save()

            # Send Email Receipt
            try:
                from django.core.mail import EmailMessage
                from django.conf import settings
                
                student = allocation.student
                email_target = student.father_email or student.mother_email or student.user.email
                
                if email_target:
                    pdf_buffer = self._generate_receipt_pdf(payment)
                    email = EmailMessage(
                        subject=f"Fee Payment Receipt - {payment.id}",
                        body=f"Dear Parent,\n\nThank you for the payment of INR {payment.amount_paid} towards {allocation.fee_master.fee_type.name}. Please find the receipt attached.\n\nRegards,\nAccounts Department\n{payment.school.name}",
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        to=[email_target],
                    )
                    email.attach(f"Receipt_{payment.id}.pdf", pdf_buffer.getvalue(), 'application/pdf')
                    email.send(fail_silently=True)
            except Exception as e:
                print(f"Failed to send fee receipt email: {e}")

    @action(detail=True, methods=['get'], url_path='receipt')
    def download_receipt(self, request, pk=None):
        payment = self.get_object()
        pdf_buffer = self._generate_receipt_pdf(payment)
        
        filename = f"Receipt_{payment.id}.pdf"
        response = HttpResponse(pdf_buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
