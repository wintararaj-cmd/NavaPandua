
from rest_framework import serializers
from .models import ExamGrade, Exam, ExamSchedule, ExamResult

class ExamGradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamGrade
        fields = '__all__'
        read_only_fields = ['school']

class ExamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exam
        fields = '__all__'
        read_only_fields = ['school']

class ExamScheduleSerializer(serializers.ModelSerializer):
    subject_name = serializers.ReadOnlyField(source='subject.name')
    exam_name = serializers.ReadOnlyField(source='exam.name')

    class Meta:
        model = ExamSchedule
        fields = '__all__'
        read_only_fields = ['school']

class ExamResultSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.get_full_name')
    subject_name = serializers.ReadOnlyField(source='exam_schedule.subject.name')
    grade_name = serializers.ReadOnlyField(source='grade.name')

    class Meta:
        model = ExamResult
        fields = '__all__'
        read_only_fields = ['school']
