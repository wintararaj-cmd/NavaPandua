"""
Admin configuration for organizations app.
"""

from django.contrib import admin
from .models import Organization, OrganizationSettings, OrganizationInvitation


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    """Admin for Organization model."""
    
    list_display = [
        'name', 'subdomain', 'owner',
        'is_active', 'total_schools', 'created_at'
    ]
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'subdomain', 'email', 'phone']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'subdomain', 'logo', 'website', 'owner', 'is_active')
        }),
        ('Contact Information', {
            'fields': ('phone', 'alternate_phone', 'email', 'alternate_email')
        }),
        ('Address', {
            'fields': ('address_line1', 'address_line2', 'city', 'state', 'country', 'postal_code')
        }),
        ('Enterprise Limits', {
            'fields': ('max_schools', 'max_students', 'max_teachers')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(OrganizationSettings)
class OrganizationSettingsAdmin(admin.ModelAdmin):
    """Admin for OrganizationSettings model."""
    
    list_display = ['organization', 'email_provider', 'sms_provider', 'payment_gateway']
    search_fields = ['organization__name']
    
    fieldsets = (
        ('Organization', {
            'fields': ('organization',)
        }),
        ('Email Configuration', {
            'fields': (
                'email_provider', 'email_from_name', 'email_from_address',
                'smtp_host', 'smtp_port', 'smtp_username', 'smtp_use_tls'
            )
        }),
        ('SMS Configuration', {
            'fields': ('sms_provider', 'sms_sender_id')
        }),
        ('Payment Gateway', {
            'fields': ('payment_gateway',)
        }),
        ('Academic Settings', {
            'fields': (
                'default_academic_year', 'default_currency',
                'default_timezone', 'default_language'
            )
        }),
        ('Feature Flags', {
            'fields': (
                'enable_online_admission', 'enable_online_payment',
                'enable_sms_notifications', 'enable_email_notifications',
                'enable_live_classes', 'enable_mobile_app'
            )
        }),
        ('Branding', {
            'fields': ('primary_color', 'secondary_color')
        }),
    )


@admin.register(OrganizationInvitation)
class OrganizationInvitationAdmin(admin.ModelAdmin):
    """Admin for OrganizationInvitation model."""
    
    list_display = [
        'email', 'organization', 'role', 'invited_by',
        'is_accepted', 'created_at'
    ]
    list_filter = ['is_accepted', 'role', 'created_at']
    search_fields = ['email', 'organization__name']
    readonly_fields = ['token', 'created_at']
