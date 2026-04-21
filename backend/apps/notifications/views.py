from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from .models import Notification, Announcement
from .serializers import NotificationSerializer, AnnouncementSerializer

class NotificationViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

    @action(detail=True, methods=['post'], url_path='read')
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        if not notification.is_read:
            notification.is_read = True
            notification.read_at = timezone.now()
            notification.save()
        return Response(NotificationSerializer(notification).data)

    @action(detail=False, methods=['post'], url_path='read-all')
    def mark_all_as_read(self, request):
        self.get_queryset().filter(is_read=False).update(
            is_read=True, 
            read_at=timezone.now()
        )
        return Response({'message': 'All notifications marked as read'})

class AnnouncementViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AnnouncementSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['target_audience', 'target_class', 'is_active']
    search_fields = ['title', 'content']
    ordering_fields = ['created_at', 'expiry_date']

    def get_queryset(self):
        user = self.request.user
        queryset = Announcement.objects.all()
        
        if not user.is_authenticated:
            return queryset.none()
            
        if user.school:
            queryset = queryset.filter(school=user.school)
            
        # Role-based filtering for consumers (Students/Teachers)
        if user.role == 'STUDENT':
            student = getattr(user, 'student_profile', None)
            if student:
                # Get announcements for ALL students, ALL people, or THEIR specific class
                from django.db.models import Q
                queryset = queryset.filter(
                    Q(target_audience='ALL') | 
                    Q(target_audience='STUDENTS') | 
                    Q(target_audience='CLASS', target_class=student.current_class)
                ).filter(is_active=True)
        elif user.role == 'TEACHER':
            queryset = queryset.filter(
                Q(target_audience='ALL') | 
                Q(target_audience='TEACHERS')
            ).filter(is_active=True)
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(
            school=self.request.user.school,
            created_by=self.request.user
        )
