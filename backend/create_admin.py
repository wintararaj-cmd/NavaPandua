import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

django.setup()

from apps.accounts.models import User

# Create super admin user
user, created = User.objects.get_or_create(
    email='admin@school.com',
    defaults={
        'username': 'admin',
        'first_name': 'Admin',
        'last_name': 'User',
        'role': 'SUPER_ADMIN',
        'is_staff': True,
        'is_superuser': True,
        'is_active': True,
    }
)

if created:
    user.set_password('admin123')
    user.save()
    print(f"✅ Created user: {user.email}")
    print(f"   Username: {user.username}")
    print(f"   Role: {user.role}")
    print(f"   Password: admin123")
else:
    # Update password if user exists
    user.set_password('admin123')
    user.role = 'SUPER_ADMIN'
    user.is_staff = True
    user.is_superuser = True
    user.is_active = True
    user.save()
    print(f"✅ Updated existing user: {user.email}")
    print(f"   Password reset to: admin123")

print("\n🎉 You can now login with:")
print("   Email: admin@school.com")
print("   Password: admin123")
