from rest_framework import serializers
from .models import LiveClass

class LiveClassSerializer(serializers.ModelSerializer):
    teacher_name = serializers.ReadOnlyField(source='teacher.user.get_full_name')
    subject_name = serializers.ReadOnlyField(source='subject.name')
    target_class_name = serializers.ReadOnlyField(source='target_class.name')
    section_name = serializers.ReadOnlyField(source='section.name', allow_null=True)

    class Meta:
        model = LiveClass
        fields = '__all__'
        read_only_fields = ['school', 'teacher']
