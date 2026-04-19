
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
        
    def create(self, validated_data):
        # Generate simple application number
        import uuid
        validated_data['application_number'] = f"APP-{uuid.uuid4().hex[:8].upper()}"
        return super().create(validated_data)
