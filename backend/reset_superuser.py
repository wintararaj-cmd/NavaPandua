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
    superusers = list(User.objects.filter(is_superuser=True))
    
    print("\nCreating new superuser...")
    admin_username = 'admin'
    admin_email = 'admin@admin.com'
    admin_password = 'admin'

    try:
        if superusers:
            # Rename existing superusers to avoid unique constraint violations
            for i, old_user in enumerate(superusers):
                try:
                    old_user.username = f"{old_user.username}_old_{i}"
                    old_user.email = f"old_{i}_{old_user.email}"
                    old_user.save()
                except Exception as e:
                    pass

        try:
            # Try to create with username
            new_user = User.objects.create_superuser(
                username=admin_username,
                email=admin_email,
                password=admin_password
            )
        except TypeError:
            # Fallback for email-only user models
            new_user = User.objects.create_superuser(
                email=admin_email,
                password=admin_password
            )
            admin_username = "(None - Email based login)"
        
        print("[OK] New superuser created successfully!")
        
        if superusers:
            print(f"Found {len(superusers)} old superuser(s). Reassigning dependencies and deleting...")
            from apps.organizations.models import Organization
            
            for old_user in superusers:
                # Reassign Organization ownership to avoid ProtectedError
                Organization.objects.filter(owner=old_user).update(owner=new_user)
                # Delete the old superuser
                old_user.delete()
            print("Successfully deleted existing superusers.")
        else:
            print("No existing superusers to delete.")
            
        print("-" * 30)
        print(f"Username: {admin_username}")
        print(f"Email:    {admin_email}")
        print(f"Password: {admin_password}")
        print("-" * 30)

    except Exception as e:
        import traceback
        print(f"[ERROR] Error during superuser reset:")
        traceback.print_exc()

if __name__ == "__main__":
    reset_superuser()
