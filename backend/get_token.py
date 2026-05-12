import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.accounts.models import User
from rest_framework_simplejwt.tokens import RefreshToken

# Get any admin user
user = User.objects.filter(role='SCHOOL_ADMIN').first()
if not user:
    user = User.objects.first()

if user:
    refresh = RefreshToken.for_user(user)
    print(f"ACCESS_TOKEN={str(refresh.access_token)}")
else:
    print("NO USERS FOUND")
