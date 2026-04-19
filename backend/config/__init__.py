"""
Config package initialization.
"""

# This will make sure the app is always imported when
# Django starts so that shared_task will use this app.
# Temporarily disabled until Celery is installed
# from .celery import app as celery_app

# __all__ = ('celery_app',)
__all__ = ()

