from django.conf import settings
from django.core.mail import send_mail
from .models import Notification

class NotificationService:
    @staticmethod
    def send_notification(user, title, message, notification_type='INFO', link=''):
        """
        Creates a system notification and dispatches email/SMS if configured.
        """
        # 1. Create In-App Notification
        Notification.objects.create(
            recipient=user,
            title=title,
            message=message,
            notification_type=notification_type,
            link=link
        )

        # 2. Send Email (Async task in real app)
        if hasattr(user, 'email') and user.email:
            try:
                # Mocking email send or using console backend
                send_mail(
                    subject=f"[{settings.ORGANIZATION_NAME}] {title}",
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=True
                )
            except Exception as e:
                print(f"Failed to send email to {user.email}: {e}")

        # 3. Send SMS
        phone = getattr(user, 'phone', None)
        if not phone and hasattr(user, 'profile'):
            phone = user.profile.phone
            
        if phone:
            self.send_sms(phone, message)

    @staticmethod
    def send_sms(phone_number, message):
        """Send SMS via Twilio."""
        try:
            from twilio.rest import Client
            from django.conf import settings
            
            if not all([settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN, settings.TWILIO_PHONE_NUMBER]):
                print(f"DEBUG SMS: [{phone_number}] {message}")
                return
                
            client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            client.messages.create(
                body=message,
                from_=settings.TWILIO_PHONE_NUMBER,
                to=str(phone_number)
            )
        except Exception as e:
            print(f"Failed to send SMS to {phone_number}: {e}")

    @staticmethod
    def send_mass_notification(users, title, message, notification_type='INFO', link=''):
        """
        Efficiently creates notifications for multiple users.
        """
        notifications = [
            Notification(
                recipient=user,
                title=title,
                message=message,
                notification_type=notification_type,
                link=link
            ) for user in users
        ]
        
        # Bulk create in-app notifications
        Notification.objects.bulk_create(notifications)
        
        # Send emails (This should ideally be offloaded to Celery for mass sending)
        recipient_emails = []
        for user in users:
            if hasattr(user, 'email') and user.email:
                recipient_emails.append(user.email)
                
        if recipient_emails:
            try:
                # Using bcc to hide recipients from each other if sending single email
                # However, for transactional emails, individual sending is better or mass_mail
                # For now, we'll iterate or use send_mass_mail if implemented.
                # Simplest for now: loop (Warning: Slow for large groups)
                from django.core.mail import send_mass_mail
                from django.conf import settings
                
                messages = [
                    (
                        f"[{settings.ORGANIZATION_NAME}] {title}",
                        message,
                        settings.DEFAULT_FROM_EMAIL,
                        [email]
                    ) for email in recipient_emails
                ]
                
                send_mass_mail(messages, fail_silently=True)
                
                # Send Mass SMS
                for user in users:
                    phone = getattr(user, 'phone', None)
                    if not phone and hasattr(user, 'profile'):
                        phone = user.profile.phone
                    if phone:
                        self.send_sms(phone, message)
                        
            except Exception as e:
                print(f"Failed to send mass notifications: {e}")
