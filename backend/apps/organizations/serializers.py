"""
Serializers for organizations.
"""

from rest_framework import serializers
from .models import Organization, OrganizationSettings, OrganizationInvitation


class OrganizationSettingsSerializer(serializers.ModelSerializer):
    """Serializer for organization settings."""
    
    class Meta:
        model = OrganizationSettings
        fields = [
            'id', 'email_provider', 'email_from_name', 'email_from_address',
            'sms_provider', 'payment_gateway', 'default_academic_year',
            'default_currency', 'default_timezone', 'default_language',
            'enable_online_admission', 'enable_online_payment',
            'enable_sms_notifications', 'enable_email_notifications',
            'enable_live_classes', 'enable_mobile_app',
            'primary_color', 'secondary_color', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class OrganizationSerializer(serializers.ModelSerializer):
    """Serializer for organization."""
    
    settings = OrganizationSettingsSerializer(read_only=True)
    total_schools = serializers.IntegerField(read_only=True)
    total_students = serializers.IntegerField(read_only=True)
    total_teachers = serializers.IntegerField(read_only=True)
    full_address = serializers.SerializerMethodField()
    
    class Meta:
        model = Organization
        fields = [
            'id', 'name', 'subdomain', 'logo', 'website',
            'phone', 'alternate_phone', 'email', 'alternate_email',
            'address_line1', 'address_line2', 'city', 'state',
            'country', 'postal_code', 'full_address',
            'is_active', 'max_schools', 'max_students', 'max_teachers',
            'owner', 'total_schools', 'total_students', 'total_teachers',
            'settings', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'owner', 'total_schools', 'total_students',
            'total_teachers', 'created_at', 'updated_at'
        ]
    
    def get_full_address(self, obj):
        return obj.get_full_address()


class CreateOrganizationSerializer(serializers.ModelSerializer):
    """Serializer for creating organization."""
    
    class Meta:
        model = Organization
        fields = [
            'name', 'subdomain', 'logo', 'website',
            'phone', 'email', 'address_line1', 'address_line2',
            'city', 'state', 'country', 'postal_code'
        ]
    
    def validate_subdomain(self, value):
        """Validate subdomain uniqueness."""
        if Organization.objects.filter(subdomain=value).exists():
            raise serializers.ValidationError('Subdomain already taken.')
        return value.lower()
    
    def create(self, validated_data):
        """Create organization and default settings."""
        request = self.context.get('request')
        validated_data['owner'] = request.user
        
        organization = Organization.objects.create(**validated_data)
        
        # Create default settings
        OrganizationSettings.objects.create(
            organization=organization,
            email_from_name=organization.name,
            email_from_address=organization.email
        )
        
        return organization


class OrganizationInvitationSerializer(serializers.ModelSerializer):
    """Serializer for organization invitations."""
    
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    invited_by_name = serializers.CharField(source='invited_by.get_full_name', read_only=True)
    
    class Meta:
        model = OrganizationInvitation
        fields = [
            'id', 'organization', 'organization_name', 'email', 'role',
            'invited_by', 'invited_by_name', 'token', 'expires_at',
            'is_accepted', 'accepted_at', 'created_at'
        ]
        read_only_fields = [
            'id', 'organization_name', 'invited_by', 'invited_by_name',
            'token', 'is_accepted', 'accepted_at', 'created_at'
        ]


class OrganizationDashboardSerializer(serializers.Serializer):
    """Serializer for organization dashboard statistics."""
    
    total_schools = serializers.IntegerField()
    total_students = serializers.IntegerField()
    total_teachers = serializers.IntegerField()
    total_classes = serializers.IntegerField()
    active_students = serializers.IntegerField()
    active_teachers = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    pending_fees = serializers.DecimalField(max_digits=12, decimal_places=2)
    recent_admissions = serializers.IntegerField()
    attendance_rate = serializers.FloatField()
