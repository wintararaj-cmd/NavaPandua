"""
Serializers for authentication and user management.
"""

from rest_framework import serializers
from django.db import models
from django.db.models import Q
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta
import uuid

from .models import User, UserProfile, EmailVerification, PasswordReset


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile."""
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'phone', 'alternate_phone', 'email', 'alternate_email',
            'bio', 'address_line1', 'address_line2', 'city', 'state',
            'country', 'postal_code', 'emergency_contact_name',
            'emergency_contact_phone', 'emergency_contact_relation',
            'blood_group', 'nationality', 'religion', 'caste',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user model."""
    
    profile = UserProfileSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()
    allowed_schools = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'phone', 'role', 'is_email_verified',
            'is_phone_verified', 'profile_picture', 'date_of_birth',
            'gender', 'organization', 'school', 'is_active',
            'date_joined', 'last_login', 'profile', 'allowed_schools'
        ]
        read_only_fields = [
            'id', 'username', 'is_email_verified', 'is_phone_verified',
            'date_joined', 'last_login'
        ]
    
    def get_full_name(self, obj):
        return obj.get_full_name()

    def get_allowed_schools(self, obj):
        """Get list of schools user is allowed to access."""
        from apps.schools.models import School
        if obj.is_superuser or obj.role == 'SUPER_ADMIN':
            return School.objects.filter(is_active=True).values('id', 'name', 'code', 'institution_type')
        
        if obj.role == 'SCHOOL_ADMIN':
            if obj.organization:
                return School.objects.filter(organization=obj.organization, is_active=True).values('id', 'name', 'code', 'institution_type')
            if obj.school_id:
                return School.objects.filter(id=obj.school_id).values('id', 'name', 'code', 'institution_type')
            return []
            
        if obj.role == 'TEACHER':
            try:
                teacher_profile = obj.teacher_profile
                return School.objects.filter(
                    Q(id=obj.school_id) | 
                    Q(allotted_teachers=teacher_profile)
                ).distinct().values('id', 'name', 'code', 'institution_type')
            except:
                if obj.school_id:
                    return School.objects.filter(id=obj.school_id).values('id', 'name', 'code', 'institution_type')
                return []
        
        if obj.school_id:
            return School.objects.filter(id=obj.school_id).values('id', 'name', 'code', 'institution_type')
        return []


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'phone', 'role',
            'date_of_birth', 'gender'
        ]
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'email': {'required': True},
        }
    
    def validate(self, attrs):
        """Validate password confirmation."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Passwords do not match.'
            })
        return attrs
    
    def validate_email(self, value):
        """Check if email already exists."""
        if User.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError('Email already registered.')
        return value.lower()
    
    def validate_username(self, value):
        """Check if username already exists."""
        if User.objects.filter(username=value.lower()).exists():
            raise serializers.ValidationError('Username already taken.')
        return value.lower()
    
    def create(self, validated_data):
        """Create user and profile."""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        
        # Create user profile
        UserProfile.objects.create(
            user=user,
            email=user.email,
            phone=user.phone
        )
        
        # Create email verification token
        token = str(uuid.uuid4())
        EmailVerification.objects.create(
            user=user,
            token=token,
            expires_at=timezone.now() + timedelta(hours=24)
        )
        
        # TODO: Send verification email
        
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        """Validate credentials and authenticate user."""
        email = attrs.get('email', '').lower().strip()
        password = attrs.get('password')
        
        if not email or not password:
            raise serializers.ValidationError('Email and password are required.')
        
        # Get user by email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            print(f"DEBUG: Login failed - User not found: {email}")
            raise serializers.ValidationError('Invalid credentials.')
        
        # Authenticate
        # Note: If USERNAME_FIELD is 'email', authenticate expects username=email
        user = authenticate(username=email, password=password)
        
        if not user:
            print(f"DEBUG: Login failed - Authentication failed for: {email}")
            raise serializers.ValidationError('Invalid credentials.')
        
        if not user.is_active:
            print(f"DEBUG: Login failed - User inactive: {email}")
            raise serializers.ValidationError('Account is disabled.')
        
        attrs['user'] = user
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password."""
    
    old_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        """Validate passwords."""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': 'Passwords do not match.'
            })
        return attrs
    
    def validate_old_password(self, value):
        """Validate old password."""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Old password is incorrect.')
        return value


class ForgotPasswordSerializer(serializers.Serializer):
    """Serializer for forgot password request."""
    
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        """Check if user exists."""
        try:
            user = User.objects.get(email=value.lower())
        except User.DoesNotExist:
            # Don't reveal if email exists or not for security
            pass
        return value.lower()


class ResetPasswordSerializer(serializers.Serializer):
    """Serializer for resetting password."""
    
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        """Validate passwords and token."""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': 'Passwords do not match.'
            })
        
        # Validate token
        try:
            reset = PasswordReset.objects.get(
                token=attrs['token'],
                is_used=False,
                expires_at__gt=timezone.now()
            )
            attrs['reset'] = reset
        except PasswordReset.DoesNotExist:
            raise serializers.ValidationError({
                'token': 'Invalid or expired token.'
            })
        
        return attrs


class VerifyEmailSerializer(serializers.Serializer):
    """Serializer for email verification."""
    
    token = serializers.CharField(required=True)
    
    def validate_token(self, value):
        """Validate verification token."""
        try:
            verification = EmailVerification.objects.get(
                token=value,
                is_used=False,
                expires_at__gt=timezone.now()
            )
            return verification
        except EmailVerification.DoesNotExist:
            raise serializers.ValidationError('Invalid or expired token.')


class UpdateProfileSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile."""
    
    profile = UserProfileSerializer(required=False)
    
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'phone', 'profile_picture',
            'date_of_birth', 'gender', 'profile'
        ]
    
    def update(self, instance, validated_data):
        """Update user and profile."""
        profile_data = validated_data.pop('profile', None)
        
        # Update user
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update profile
        if profile_data and hasattr(instance, 'profile'):
            profile = instance.profile
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()
        
        return instance
