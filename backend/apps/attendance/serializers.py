
from rest_framework import serializers
from .models import StudentAttendance, TeacherAttendance, LeaveType, LeaveApplication


class StudentAttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.get_full_name')
    class_name = serializers.ReadOnlyField(source='student.current_class.name')
    section_name = serializers.ReadOnlyField(source='student.section.name')

    class Meta:
        model = StudentAttendance
        fields = '__all__'
        read_only_fields = ['school']

class TeacherAttendanceSerializer(serializers.ModelSerializer):
    teacher_name = serializers.ReadOnlyField(source='teacher.get_full_name')

    class Meta:
        model = TeacherAttendance
        fields = '__all__'
        read_only_fields = ['school']

class LeaveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveType
        fields = '__all__'
        read_only_fields = ['school']

class LeaveApplicationSerializer(serializers.ModelSerializer):
    applicant_name = serializers.ReadOnlyField(source='applicant.get_full_name')
    leave_type_name = serializers.ReadOnlyField(source='leave_type.name')
    approver_name = serializers.ReadOnlyField(source='approved_by.get_full_name')

    class Meta:
        model = LeaveApplication
        fields = '__all__'
        read_only_fields = ['school', 'applicant', 'status', 'approved_by', 'rejection_reason']


class BulkAttendanceSerializer(serializers.Serializer):
    date = serializers.DateField()
    attendance_data = serializers.ListField(
        child=serializers.DictField()
    )
    # attendance_data will be list of {student_id: id, status: status, remarks: remarks}
