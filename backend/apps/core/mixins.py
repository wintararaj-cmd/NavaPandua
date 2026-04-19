from django.db import models

class SchoolFilterMixin:
    """
    Mixin to filter querysets by the user's school and handle auto-saving school.
    """
    def get_queryset(self):
        queryset = super().get_queryset().filter(is_deleted=False)
        user = self.request.user
        
        if not user.is_authenticated:
            return queryset.none()

        # Super Admins see everything
        if user.is_superuser or getattr(user, 'is_super_admin', False):
            return queryset
            
        # Others only see their school's data
        if user.school:
            return queryset.filter(school=user.school)
            
        return queryset.none()

    def perform_create(self, serializer):
        """Auto-assign school during creation."""
        user = self.request.user
        if user.school:
            serializer.save(school=user.school)
        else:
            serializer.save()
