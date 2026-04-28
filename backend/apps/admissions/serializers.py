
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
            school = validated_data.get('school')
            if not school and 'request' in self.context:
                school = self.context['request'].user.school
            
            if school:
                from apps.schools.models import SchoolSettings
                from apps.core.utils import generate_next_id
                from django.utils import timezone
                
                school_settings = SchoolSettings.objects.filter(school=school).first()
                prefix = school_settings.application_id_prefix if school_settings else 'REG'
                # Add year to prefix if desired, e.g., REG-2026-
                current_year = timezone.now().year
                prefix = f"{prefix}-{current_year}-"
                length = school_settings.id_number_length if school_settings else 6
                
                validated_data['application_number'] = generate_next_id(AdmissionApplication, 'application_number', prefix, length)
            else:
                # Fallback to UUID if school is not available
                import uuid
                validated_data['application_number'] = f"APP-{uuid.uuid4().hex[:8].upper()}"
        
        return super().create(validated_data)

