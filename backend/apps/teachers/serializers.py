from rest_framework import serializers
from django.db import transaction
from django.contrib.auth import get_user_model
from apps.accounts.serializers import UserSerializer
from .models import Teacher

User = get_user_model()

class TeacherSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    school_name = serializers.CharField(source='school.name', read_only=True)

    class Meta:
        model = Teacher
        fields = [
            'id', 'user', 'school', 'school_name', 'assigned_schools',
            'employee_id', 'department', 'designation', 
            'qualification', 'joining_date',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'school']

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        assigned_schools = validated_data.pop('assigned_schools', [])
        
        # Set default password if not provided
        password = user_data.pop('password', 'teacher123')
            
        user_data['role'] = 'TEACHER'
        user_data['username'] = user_data['email']  # Use email as username

        # Remove non-model fields that might be in user_data from UserSerializer
        valid_user_fields = [f.name for f in User._meta.get_fields()]
        user_create_data = {k: v for k, v in user_data.items() if k in valid_user_fields}
        
        with transaction.atomic():
            # Create User
            user = User.objects.create_user(password=password, **user_create_data)
            
            # Create Teacher
            teacher = Teacher.objects.create(user=user, **validated_data)
            
            # Handle ManyToMany
            if assigned_schools:
                teacher.assigned_schools.set(assigned_schools)
            
        return teacher

    def update(self, instance, validated_data):
        assigned_schools = validated_data.pop('assigned_schools', None)
        
        if 'user' in validated_data:
            user_data = validated_data.pop('user')
            user = instance.user
            
            # Update user fields
            for attr, value in user_data.items():
                if attr != 'password':
                    setattr(user, attr, value)
            user.save()
        
        # Update ManyToMany
        if assigned_schools is not None:
            instance.assigned_schools.set(assigned_schools)
            
        return super().update(instance, validated_data)
