"""Admin configuration for schools app."""
from django.contrib import admin
from .models import School, SchoolSettings, AcademicYear, Holiday

@admin.register(School)
class SchoolAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'organization', 'city', 'is_active', 'created_at']
    list_filter = ['is_active', 'board', 'created_at']
    search_fields = ['name', 'code', 'city']

@admin.register(SchoolSettings)
class SchoolSettingsAdmin(admin.ModelAdmin):
    list_display = ['school', 'grading_system', 'passing_percentage']

@admin.register(AcademicYear)
class AcademicYearAdmin(admin.ModelAdmin):
    list_display = ['school', 'name', 'start_date', 'end_date', 'is_current']
    list_filter = ['is_current']

@admin.register(Holiday)
class HolidayAdmin(admin.ModelAdmin):
    list_display = ['school', 'name', 'date', 'end_date']
    list_filter = ['date']
