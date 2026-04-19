from rest_framework import permissions

class IsSuperAdmin(permissions.BasePermission):
    """
    Allows access only to super admins.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_super_admin)

class IsSchoolAdmin(permissions.BasePermission):
    """
    Allows access only to school admins.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_school_admin)

class IsTeacher(permissions.BasePermission):
    """
    Allows access only to teachers.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_teacher)

class IsStudent(permissions.BasePermission):
    """
    Allows access only to students.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_student)

class IsParent(permissions.BasePermission):
    """
    Allows access only to parents.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_parent)

class IsAdminOrTeacher(permissions.BasePermission):
    """
    Allows access to school admins and teachers.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.is_school_admin or request.user.is_teacher or request.user.is_super_admin)
        )

class IsSchoolStaff(permissions.BasePermission):
    """
    Allows access to anyone working at the school (Admin, Teacher, Librarian, etc.)
    """
    def has_permission(self, request, view):
        staff_roles = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'LIBRARIAN', 'ACCOUNTANT', 'RECEPTIONIST']
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role in staff_roles
        )
