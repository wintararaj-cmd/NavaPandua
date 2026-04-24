"""
Views for authentication and user management.
"""

from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from datetime import timedelta
import uuid

from .models import User, UserProfile, EmailVerification, PasswordReset, UserActivity
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    LoginSerializer,
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    VerifyEmailSerializer,
    UpdateProfileSerializer,
    CreateStaffSerializer
)


def get_tokens_for_user(user):
    """Generate JWT tokens for user."""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


def log_user_activity(user, action, description='', request=None):
    """Log user activity."""
    ip_address = None
    user_agent = ''
    
    if request:
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip_address = x_forwarded_for.split(',')[0]
        else:
            ip_address = request.META.get('REMOTE_ADDR')
        user_agent = request.META.get('HTTP_USER_AGENT', '')
    
    UserActivity.objects.create(
        user=user,
        action=action,
        description=description,
        ip_address=ip_address,
        user_agent=user_agent
    )


class RegisterView(generics.CreateAPIView):
    """
    Register a new user.
    
    POST /api/v1/auth/register/
    """
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Log activity
        log_user_activity(user, 'REGISTER', 'User registered', request)
        
        # Generate tokens
        tokens = get_tokens_for_user(user)
        
        return Response({
            'success': True,
            'message': 'Registration successful. Please verify your email.',
            'data': {
                'user': UserSerializer(user).data,
                'tokens': tokens
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """
    Login user and return JWT tokens.
    
    POST /api/v1/auth/login/
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        
        # Log activity
        log_user_activity(user, 'LOGIN', 'User logged in', request)
        
        # Generate tokens
        tokens = get_tokens_for_user(user)
        
        return Response({
            'success': True,
            'message': 'Login successful.',
            'data': {
                'user': UserSerializer(user).data,
                'tokens': tokens
            }
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """
    Logout user by blacklisting refresh token.
    
    POST /api/v1/auth/logout/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            # Log activity
            log_user_activity(request.user, 'LOGOUT', 'User logged out', request)
            
            return Response({
                'success': True,
                'message': 'Logout successful.'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'success': False,
                'error': {
                    'message': 'Invalid token.',
                    'details': str(e)
                }
            }, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserView(generics.RetrieveAPIView):
    """
    Get current authenticated user.
    
    GET /api/v1/auth/me/
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class UpdateProfileView(generics.UpdateAPIView):
    """
    Update user profile.
    
    PUT/PATCH /api/v1/auth/profile/
    """
    serializer_class = UpdateProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Log activity
        log_user_activity(request.user, 'UPDATE_PROFILE', 'Profile updated', request)
        
        return Response({
            'success': True,
            'message': 'Profile updated successfully.',
            'data': UserSerializer(instance).data
        })


class ChangePasswordView(APIView):
    """
    Change user password.
    
    POST /api/v1/auth/change-password/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        # Change password
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        # Log activity
        log_user_activity(user, 'CHANGE_PASSWORD', 'Password changed', request)
        
        return Response({
            'success': True,
            'message': 'Password changed successfully.'
        }, status=status.HTTP_200_OK)


class ForgotPasswordView(APIView):
    """
    Request password reset.
    
    POST /api/v1/auth/forgot-password/
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        
        try:
            user = User.objects.get(email=email)
            
            # Create password reset token
            token = str(uuid.uuid4())
            PasswordReset.objects.create(
                user=user,
                token=token,
                expires_at=timezone.now() + timedelta(hours=1)
            )
            
            # TODO: Send password reset email
            # send_password_reset_email(user, token)
            
            # Log activity
            log_user_activity(user, 'FORGOT_PASSWORD', 'Password reset requested', request)
            
        except User.DoesNotExist:
            # Don't reveal if email exists
            pass
        
        return Response({
            'success': True,
            'message': 'If your email is registered, you will receive a password reset link.'
        }, status=status.HTTP_200_OK)


class ResetPasswordView(APIView):
    """
    Reset password using token.
    
    POST /api/v1/auth/reset-password/
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        reset = serializer.validated_data['reset']
        user = reset.user
        
        # Set new password
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        # Mark token as used
        reset.is_used = True
        reset.save()
        
        # Log activity
        log_user_activity(user, 'RESET_PASSWORD', 'Password reset', request)
        
        return Response({
            'success': True,
            'message': 'Password reset successful. You can now login with your new password.'
        }, status=status.HTTP_200_OK)


class VerifyEmailView(APIView):
    """
    Verify email using token.
    
    POST /api/v1/auth/verify-email/
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = VerifyEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        verification = serializer.validated_data['token']
        user = verification.user
        
        # Mark email as verified
        user.is_email_verified = True
        user.save()
        
        # Mark token as used
        verification.is_used = True
        verification.save()
        
        # Log activity
        log_user_activity(user, 'VERIFY_EMAIL', 'Email verified', request)
        
        return Response({
            'success': True,
            'message': 'Email verified successfully.'
        }, status=status.HTTP_200_OK)


class ResendVerificationView(APIView):
    """
    Resend email verification.
    
    POST /api/v1/auth/resend-verification/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        user = request.user
        
        if user.is_email_verified:
            return Response({
                'success': False,
                'error': {
                    'message': 'Email already verified.'
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create new verification token
        token = str(uuid.uuid4())
        EmailVerification.objects.create(
            user=user,
            token=token,
            expires_at=timezone.now() + timedelta(hours=24)
        )
        
        # TODO: Send verification email
        # send_verification_email(user, token)
        
        return Response({
            'success': True,
            'message': 'Verification email sent.'
        }, status=status.HTTP_200_OK)


class UserActivityView(generics.ListAPIView):
    """
    Get user activity history.
    
    GET /api/v1/auth/activity/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def list(self, request, *args, **kwargs):
        activities = UserActivity.objects.filter(
            user=request.user
        ).order_by('-created_at')[:50]
        
        data = [{
            'id': str(activity.id),
            'action': activity.action,
            'description': activity.description,
            'ip_address': activity.ip_address,
            'created_at': activity.created_at
        } for activity in activities]
        
        return Response({
            'success': True,
            'data': data
        })
class SwitchSchoolView(APIView):
    """
    Switch current active school for the user.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        school_id = request.data.get('school_id')
        if not school_id:
            return Response({'error': 'school_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        from apps.schools.models import School
        try:
            target_school = School.objects.get(id=school_id, is_active=True)
            user = request.user

            # Authorization Check
            can_switch = False
            if user.is_superuser:
                can_switch = True
            elif user.role == 'SCHOOL_ADMIN' and user.organization == target_school.organization:
                can_switch = True
            elif user.role == 'TEACHER':
                try:
                    teacher_profile = user.teacher_profile
                    if target_school == user.school or target_school.allotted_teachers.filter(id=teacher_profile.id).exists():
                        can_switch = True
                except:
                    pass
            
            if not can_switch:
                return Response({'error': 'You do not have permission to access this school'}, status=status.HTTP_403_FORBIDDEN)

            # Update User's active school
            user.school = target_school
            user.save()

            return Response({
                'success': True,
                'message': f'Switched to {target_school.name}',
                'data': {
                    'user': UserSerializer(user).data
                }
            })

        except School.DoesNotExist:
            return Response({'error': 'School not found'}, status=status.HTTP_404_NOT_FOUND)


class StaffListCreateView(generics.ListCreateAPIView):
    """
    List all staff members or create a new one.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateStaffSerializer
        return UserSerializer
        
    def get_queryset(self):
        # Return users who have a staff profile
        return User.objects.filter(
            staff_profile__isnull=False,
            school=self.request.user.school
        ).distinct()


class StaffDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a staff member.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return User.objects.filter(
            staff_profile__isnull=False,
            school=self.request.user.school
        )

class UserListCreateView(generics.ListCreateAPIView):
    """
    List all users in the school or create a new user.
    Used for the 'Manage Users' functionality.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = User.objects.filter(school=user.school)
        
        # Optional filters
        role = self.request.query_params.get('role', None)
        is_active = self.request.query_params.get('is_active', None)
        
        if role:
            queryset = queryset.filter(role=role)
        if is_active is not None:
            is_active_bool = is_active.lower() == 'true'
            queryset = queryset.filter(is_active=is_active_bool)
            
        return queryset

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete any user.
    Used for the 'Manage Users' functionality (e.g. Activate/Deactivate Utility).
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return User.objects.filter(school=self.request.user.school)
