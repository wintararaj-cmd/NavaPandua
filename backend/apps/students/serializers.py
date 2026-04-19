
from rest_framework import serializers
from .models import Student
from apps.classes.serializers import ClassSerializer, SectionSerializer

class StudentSerializer(serializers.ModelSerializer):
    class_details = ClassSerializer(source='current_class', read_only=True)
    section_details = SectionSerializer(source='section', read_only=True)
    
    class Meta:
        model = Student
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'admission_number']
