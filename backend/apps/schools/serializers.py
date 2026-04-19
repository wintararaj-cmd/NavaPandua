"""
Serializers for schools.
"""

from rest_framework import serializers
from .models import School, SchoolSettings, AcademicYear, Holiday


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
    class Meta:
        model = School
        exclude = ['id', 'created_at', 'updated_at', 'is_deleted', 'deleted_at']
    
    def create(self, validated_data):
        school = School.objects.create(**validated_data)
        SchoolSettings.objects.create(school=school)
        return school
