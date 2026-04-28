import os
import sys
import django

# Add backend directory to sys.path
backend_path = os.path.join(os.getcwd(), 'backend')
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()
try:
    user = User.objects.get(username='app_reg-2026-925793')
    print(f"User DOB: {user.date_of_birth}")
except User.DoesNotExist:
    print("User not found")
except Exception as e:
    print(f"Error: {e}")
