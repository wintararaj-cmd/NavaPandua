
from rest_framework import serializers
from .models import AdmissionEnquiry, AdmissionApplication
from apps.classes.serializers import ClassSerializer

class AdmissionEnquirySerializer(serializers.ModelSerializer):
    class_details = ClassSerializer(source='target_class', read_only=True)
    
    class Meta:
        model = AdmissionEnquiry
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class AdmissionApplicationSerializer(serializers.ModelSerializer):
    class_details = ClassSerializer(source='target_class', read_only=True)
    
    class Meta:
        model = AdmissionApplication
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'application_number']
        
    def validate_father_income(self, value):
        if value == '' or value == 'null':
            return None
        return value

    def create(self, validated_data):
        # Generate application number if not present
        if not validated_data.get('application_number'):
            receipt_no = validated_data.get('receipt_no')
            if receipt_no:
                validated_data['application_number'] = receipt_no
            else:
                import uuid
                validated_data['application_number'] = f"APP-{uuid.uuid4().hex[:8].upper()}"
        
        # Ensure application_number is unique
        base_app_no = validated_data['application_number']
        counter = 1
        while AdmissionApplication.objects.filter(application_number=validated_data['application_number']).exists():
            validated_data['application_number'] = f"{base_app_no}-{counter}"
            counter += 1
            
        return super().create(validated_data)
