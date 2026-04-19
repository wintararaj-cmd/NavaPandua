from django.contrib import admin
from .models import Teacher

@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ('employee_id', 'get_full_name', 'school', 'department', 'designation', 'is_active')
    list_filter = ('school', 'department', 'designation', 'user__is_active')
    search_fields = ('employee_id', 'user__first_name', 'user__last_name', 'user__email')
    raw_id_fields = ('user', 'school')

    def get_full_name(self, obj):
        return obj.user.get_full_name()
    get_full_name.short_description = 'Name'

    def is_active(self, obj):
        return obj.user.is_active
    is_active.boolean = True
