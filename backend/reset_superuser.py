import os
import sys
import django

# Setup Django environment
# Add the backend directory to the python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def reset_superuser():
    print("Finding existing superusers...")
    superusers = User.objects.filter(is_superuser=True)
    count = superusers.count()
    
    if count > 0:
        # Keep track of the emails to recreate if needed, or just use a default
        print(f"Found {count} superuser(s). Deleting...")
        superusers.delete()
        print("Successfully deleted existing superusers.")
    else:
        print("No existing superusers found.")

    print("\nCreating new superuser...")
    try:
        # Default credentials
        admin_username = 'admin'
        admin_email = 'admin@admin.com'
        admin_password = 'admin'

        # Depending on the custom User model, create_superuser might require different arguments.
        # This handles the most common cases (with username, or email only)
        try:
            user = User.objects.create_superuser(
                username=admin_username,
                email=admin_email,
                password=admin_password
            )
        except TypeError:
            # If the user model uses email as the USERNAME_FIELD and doesn't take username
            user = User.objects.create_superuser(
                email=admin_email,
                password=admin_password
            )
            admin_username = "(None - Email based login)"
            
        print("✅ Superuser created successfully!")
        print("-" * 30)
        print(f"Username: {admin_username}")
        print(f"Email:    {admin_email}")
        print(f"Password: {admin_password}")
        print("-" * 30)

    except Exception as e:
        print(f"❌ Error creating superuser: {e}")

if __name__ == "__main__":
    reset_superuser()
