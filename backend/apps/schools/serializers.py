"""
Serializers for schools.
"""

from rest_framework import serializers
import logging

logger = logging.getLogger(__name__)

from .models import School, SchoolSettings, AcademicYear, Holiday, MasterData


class SchoolSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolSettings
        exclude = ['id', 'school', 'created_at', 'updated_at', 'is_deleted', 'deleted_at']


class AcademicYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicYear
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class HolidaySerializer(serializers.ModelSerializer):
    is_multi_day = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Holiday
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class SchoolSerializer(serializers.ModelSerializer):
    settings = SchoolSettingsSerializer(read_only=True)
    total_students = serializers.IntegerField(read_only=True)
    total_teachers = serializers.IntegerField(read_only=True)
    total_classes = serializers.IntegerField(read_only=True)
    full_address = serializers.SerializerMethodField()
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    
    class Meta:
        model = School
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_full_address(self, obj):
        return obj.get_full_address()


class CreateSchoolSerializer(serializers.ModelSerializer):
    admin_email = serializers.EmailField(write_only=True, required=False)
    admin_password = serializers.CharField(write_only=True, required=False, style={'input_type': 'password'})

    class Meta:
        model = School
        exclude = ['id', 'created_at', 'updated_at', 'is_deleted', 'deleted_at']
    
    def validate_board(self, value):
        if value:
            value_upper = value.upper()
            valid_choices = [choice[0] for choice in School._meta.get_field('board').choices]
            if value_upper in valid_choices:
                return value_upper
        return value

    def validate_institution_type(self, value):
        if value:
            value_upper = value.upper()
            valid_choices = [choice[0] for choice in School._meta.get_field('institution_type').choices]
            if value_upper in valid_choices:
                return value_upper
        return value

    def validate_admin_email(self, value):
        if value:
            from apps.accounts.models import User
            if User.objects.filter(email=value).exists():
                raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        logger.info(f"Creating school with data: {validated_data}")
        admin_email = validated_data.pop('admin_email', None)
        admin_password = validated_data.pop('admin_password', None)
        
        try:
            school = School.objects.create(**validated_data)
            SchoolSettings.objects.create(school=school)
            
            if admin_email and admin_password:
                from apps.accounts.models import User
                User.objects.create_user(
                    email=admin_email,
                    username=admin_email, # Use email as username for simplicity
                    password=admin_password,
                    role=User.UserRole.SCHOOL_ADMIN,
                    school=school,
                    organization=school.organization,
                    first_name=school.principal_name or school.name
                )
                logger.info(f"Created admin user for school: {admin_email}")
                
            return school
        except Exception as e:
            logger.error(f"Error creating school: {str(e)}")
            raise serializers.ValidationError({'non_field_errors': [str(e)]})


class MasterDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = MasterData
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
