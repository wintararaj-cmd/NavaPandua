from rest_framework import serializers
from .models import Period, TimetableEntry

class PeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = Period
        fields = '__all__'
        read_only_fields = ['school']

class TimetableEntrySerializer(serializers.ModelSerializer):
    subject_name = serializers.ReadOnlyField(source='subject.name')
    teacher_name = serializers.ReadOnlyField(source='teacher.user.get_full_name')
    target_class_name = serializers.ReadOnlyField(source='target_class.name')
    section_name = serializers.ReadOnlyField(source='section.name')
    period_name = serializers.ReadOnlyField(source='period.name')
    start_time = serializers.ReadOnlyField(source='period.start_time')
    end_time = serializers.ReadOnlyField(source='period.end_time')

    class Meta:
        model = TimetableEntry
        fields = '__all__'
        read_only_fields = ['school']
