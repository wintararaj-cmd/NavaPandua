from rest_framework import viewsets, permissions, status, filters, serializers

from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from django.utils import timezone

from .models import (
    InventoryCategory, InventoryItem, InventoryStock, 
    InventoryIssue, InventoryTransaction
)
from .serializers import (
    InventoryCategorySerializer, InventoryItemSerializer, 
    InventoryStockSerializer, InventoryIssueSerializer, 
    InventoryTransactionSerializer
)

class InventoryBaseViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]

    def get_queryset(self):
        return self.queryset.filter(school=self.request.user.school)

    def perform_create(self, serializer):
        serializer.save(school=self.request.user.school)

class InventoryCategoryViewSet(InventoryBaseViewSet):
    queryset = InventoryCategory.objects.all()
    serializer_class = InventoryCategorySerializer
    search_fields = ['name']

class InventoryItemViewSet(InventoryBaseViewSet):
    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemSerializer
    filterset_fields = ['category', 'is_asset']
    search_fields = ['name', 'item_code']

    @action(detail=True, methods=['post'], url_path='add-stock')
    def add_stock(self, request, pk=None):
        item = self.get_object()
        quantity = request.data.get('quantity')
        remarks = request.data.get('remarks', '')
        reference = request.data.get('reference_id', '')

        if not quantity or int(quantity) <= 0:
            return Response({"error": "Valid quantity required"}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            stock, created = InventoryStock.objects.get_or_create(
                item=item,
                school=request.user.school,
                defaults={'quantity': 0}
            )
            stock.quantity += int(quantity)
            stock.save()

            InventoryTransaction.objects.create(
                school=request.user.school,
                item=item,
                transaction_type='PURCHASE',
                quantity=int(quantity),
                reference_id=reference,
                performed_by=request.user,
                remarks=remarks
            )

        return Response({"status": "Stock updated", "current_quantity": stock.quantity})

class InventoryStockViewSet(InventoryBaseViewSet):
    queryset = InventoryStock.objects.all()
    serializer_class = InventoryStockSerializer
    filterset_fields = ['item__category']
    search_fields = ['item__name']

class InventoryIssueViewSet(InventoryBaseViewSet):
    queryset = InventoryIssue.objects.all()
    serializer_class = InventoryIssueSerializer
    filterset_fields = ['status', 'item']
    search_fields = ['issued_to_staff__user__first_name', 'issued_to_room']

    def perform_create(self, serializer):
        item = serializer.validated_data['item']
        quantity = serializer.validated_data['quantity']
        
        with transaction.atomic():
            # Check stock
            stock = InventoryStock.objects.get(item=item, school=self.request.user.school)
            if stock.quantity < quantity:
                raise serializers.ValidationError("Insufficient stock")
            
            # Reduce stock
            stock.quantity -= quantity
            stock.save()
            
            # Create transaction
            InventoryTransaction.objects.create(
                school=self.request.user.school,
                item=item,
                transaction_type='ISSUE',
                quantity=-quantity,
                performed_by=self.request.user,
                remarks=f"Issued to {serializer.validated_data.get('issued_to_staff') or serializer.validated_data.get('issued_to_room')}"
            )
            
            serializer.save(
                school=self.request.user.school,
                issued_by=self.request.user,
                status='ISSUED'
            )

    @action(detail=True, methods=['post'], url_path='return')
    def return_item(self, request, pk=None):
        issue = self.get_object()
        if issue.status == 'RETURNED':
            return Response({"error": "Already returned"}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            issue.status = 'RETURNED'
            issue.return_date = timezone.now().date()
            issue.save()

            # Add back to stock
            stock = InventoryStock.objects.get(item=issue.item, school=request.user.school)
            stock.quantity += issue.quantity
            stock.save()

            # Create transaction
            InventoryTransaction.objects.create(
                school=request.user.school,
                item=issue.item,
                transaction_type='RETURN',
                quantity=issue.quantity,
                performed_by=request.user,
                remarks=f"Returned from {issue.issued_to_staff or issue.issued_to_room}"
            )

        return Response({"status": "Item returned successfully"})

class InventoryTransactionViewSet(InventoryBaseViewSet):
    queryset = InventoryTransaction.objects.all()
    serializer_class = InventoryTransactionSerializer
    filterset_fields = ['transaction_type', 'item']
    ordering = ['-transaction_date']
