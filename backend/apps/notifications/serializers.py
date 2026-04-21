from rest_framework import serializers
from .models import Notification, Announcement

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['recipient', 'created_at', 'updated_at', 'read_at']

class AnnouncementSerializer(serializers.ModelSerializer):
    target_class_name = serializers.CharField(source='target_class.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = Announcement
        fields = '__all__'
        read_only_fields = ['school', 'created_by', 'created_at', 'updated_at']
