from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import School, SchoolPublicPage

@receiver(post_save, sender=School)
def create_school_public_page(sender, instance, created, **kwargs):
    """
    Automatically create a default public page when a new school is created.
    """
    if created:
        SchoolPublicPage.objects.create(
            school=instance,
            vision=f"To provide quality education at {instance.name}.",
            mission=f"To empower students of {instance.name} for a better future.",
            about_text=instance.about or f"Welcome to {instance.name}."
        )
