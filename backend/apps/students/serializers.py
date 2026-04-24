
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Student, StudentPromotionHistory, SchoolLeavingCertificate, StudentSibling
from apps.classes.serializers import ClassSerializer, SectionSerializer
from apps.accounts.models import UserProfile

User = get_user_model()

class StudentSiblingSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentSibling
        fields = ['id', 'name', 'class_name', 'section', 'roll', 'registration_number']

class StudentSerializer(serializers.ModelSerializer):
    class_details = ClassSerializer(source='current_class', read_only=True)
    section_details = SectionSerializer(source='section', read_only=True)
    siblings = StudentSiblingSerializer(many=True, read_only=True)
    
    class Meta:
        model = Student
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'admission_number']


class CreateStudentSerializer(serializers.ModelSerializer):
    """Unified serializer for creating a User and Student together."""
    first_name = serializers.CharField(max_length=150, write_only=True)
    middle_name = serializers.CharField(max_length=150, write_only=True, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, write_only=True)
    email = serializers.EmailField(write_only=True, required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20, write_only=True, required=False, allow_blank=True)
    gender = serializers.CharField(max_length=10, write_only=True, required=False)
    date_of_birth = serializers.DateField(write_only=True, required=False, allow_null=True)
    siblings = StudentSiblingSerializer(many=True, required=False)
    
    class Meta:
        model = Student
        exclude = ['user', 'school']
        
    def create(self, validated_data):
        # Extract User data
        first_name = validated_data.pop('first_name')
        middle_name = validated_data.pop('middle_name', '')
        last_name = validated_data.pop('last_name')
        email = validated_data.pop('email', '')
        phone = validated_data.pop('phone', '')
        gender = validated_data.pop('gender', 'MALE')
        date_of_birth = validated_data.pop('date_of_birth', None)
        siblings_data = validated_data.pop('siblings', [])

        user_data = {
            'first_name': first_name,
            'last_name': last_name,
            'email': email,
            'phone': phone,
            'gender': gender,
            'date_of_birth': date_of_birth,
            'role': 'STUDENT'
        }
        
        # If no email is provided, generate a dummy one
        if not user_data['email']:
            user_data['email'] = f"student_{validated_data.get('admission_number')}@school.local"
            
        user_data['username'] = user_data['email']
        password = User.objects.make_random_password()
        
        user = User.objects.create_user(password=password, **user_data)
        
        # Create standard profile
        UserProfile.objects.create(user=user, email=user.email, phone=user.phone)
        
        # Get school from context
        school = self.context['request'].user.school
        validated_data['school'] = school
        
        # Create student profile
        student = Student.objects.create(user=user, middle_name=middle_name, **validated_data)
        
        # Create siblings
        from .models import StudentSibling
        for sibling_data in siblings_data:
            StudentSibling.objects.create(student=student, **sibling_data)
            
        return student


class StudentPromotionHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentPromotionHistory
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'date_promoted']


class SchoolLeavingCertificateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolLeavingCertificate
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
