from rest_framework import serializers
from .models import InventoryCategory, InventoryItem, InventoryStock, InventoryIssue, InventoryTransaction

class InventoryCategorySerializer(serializers.ModelSerializer):
    item_count = serializers.IntegerField(source='items.count', read_only=True)

    class Meta:
        model = InventoryCategory
        fields = ['id', 'name', 'description', 'item_count', 'created_at']
        read_only_fields = ['id', 'created_at']

class InventoryItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    stock_quantity = serializers.IntegerField(source='stock.quantity', read_only=True)

    class Meta:
        model = InventoryItem
        fields = [
            'id', 'category', 'category_name', 'name', 'item_code', 
            'description', 'unit', 'is_asset', 'asset_tag_prefix', 
            'reorder_level', 'stock_quantity'
        ]
        read_only_fields = ['id']

class InventoryStockSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item.name', read_only=True)
    category_name = serializers.CharField(source='item.category.name', read_only=True)

    class Meta:
        model = InventoryStock
        fields = ['id', 'item', 'item_name', 'category_name', 'quantity', 'last_updated']
        read_only_fields = ['id', 'last_updated']

class InventoryIssueSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item.name', read_only=True)
    staff_name = serializers.SerializerMethodField()
    issued_by_name = serializers.CharField(source='issued_by.get_full_name', read_only=True)

    class Meta:
        model = InventoryIssue
        fields = [
            'id', 'item', 'item_name', 'issued_to_staff', 'staff_name',
            'issued_to_room', 'quantity', 'issue_date', 'due_date',
            'return_date', 'status', 'remarks', 'issued_by', 'issued_by_name'
        ]
        read_only_fields = ['id', 'issued_by']

    def get_staff_name(self, obj):
        if obj.issued_to_staff:
            return obj.issued_to_staff.user.get_full_name()
        return None

class InventoryTransactionSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item.name', read_only=True)
    performed_by_name = serializers.CharField(source='performed_by.get_full_name', read_only=True)

    class Meta:
        model = InventoryTransaction
        fields = [
            'id', 'item', 'item_name', 'transaction_type', 'quantity',
            'reference_id', 'transaction_date', 'performed_by', 
            'performed_by_name', 'remarks'
        ]
        read_only_fields = ['id', 'transaction_date', 'performed_by']
