
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

    def validate(self, data):
        # Validate age criteria based on class
        target_class = data.get('target_class')
        date_of_birth = data.get('date_of_birth')
        school = data.get('school')
        
        if target_class and date_of_birth and school:
            from apps.schools.models import SchoolSettings
            import datetime
            from django.utils import timezone
            
            settings = SchoolSettings.objects.filter(school=school).first()
            cutoff_month = settings.age_cutoff_month if settings else 4
            cutoff_day = settings.age_cutoff_day if settings else 1
            
            # Determine the target year. Use 2026 as default if it's the next session
            # Or use current_year + 1 if we are in late 2025.
            now = timezone.now()
            target_year = now.year
            if now.month > cutoff_month or (now.month == cutoff_month and now.day >= cutoff_day):
                target_year = now.year + 1
            
            target_date = datetime.date(target_year, cutoff_month, cutoff_day)
            
            # Calculate age in years
            age = target_date.year - date_of_birth.year - ((target_date.month, target_date.day) < (date_of_birth.month, date_of_birth.day))
            
            if target_class.min_age is not None and age < target_class.min_age:
                raise serializers.ValidationError({
                    "date_of_birth": f"Age must be at least {target_class.min_age} years as on {target_date.strftime('%d %B %Y')} for {target_class.name}."
                })
            
            if target_class.max_age is not None and age > target_class.max_age:
                raise serializers.ValidationError({
                    "date_of_birth": f"Age must not exceed {target_class.max_age} years as on {target_date.strftime('%d %B %Y')} for {target_class.name}."
                })
                
        return data

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

