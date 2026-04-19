
from rest_framework import serializers
from .models import FeeGroup, FeeType, FeeMaster, FeeAllocation, FeePayment

class FeeGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeeGroup
        fields = '__all__'
        read_only_fields = ['school']

class FeeTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeeType
        fields = '__all__'
        read_only_fields = ['school']

class FeeMasterSerializer(serializers.ModelSerializer):
    fee_group_name = serializers.ReadOnlyField(source='fee_group.name')
    fee_type_name = serializers.ReadOnlyField(source='fee_type.name')

    class Meta:
        model = FeeMaster
        fields = '__all__'
        read_only_fields = ['school']

class FeeAllocationSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.get_full_name')
    fee_type_name = serializers.ReadOnlyField(source='fee_master.fee_type.name')
    remaining_amount = serializers.ReadOnlyField()

    class Meta:
        model = FeeAllocation
        fields = '__all__'
        read_only_fields = ['school']

class FeePaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeePayment
        fields = '__all__'
        read_only_fields = ['school']

    def create(self, validated_data):
        payment = super().create(validated_data)
        # Update allocation paid_amount and status
        allocation = payment.allocation
        allocation.paid_amount += payment.amount_paid
        if allocation.paid_amount >= allocation.amount:
            allocation.status = 'PAID'
        elif allocation.paid_amount > 0:
            allocation.status = 'PARTIAL'
        allocation.save()
        return payment
