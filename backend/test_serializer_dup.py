import os
import django

# Set up Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.accounts.models import User
from apps.teachers.serializers import TeacherSerializer
from django.http import QueryDict

# Create dummy user first
try:
    User.objects.create_user(username='test.script@gmail.com', email='test.script@gmail.com', password='test')
except Exception:
    pass # Already exists

data = {
    'first_name': 'Sheikh',
    'last_name': 'Kajol',
    'gender': 'MALE',
    'role': 'TEACHER',
    'email': 'test.script@gmail.com', # SAME EMAIL!
    'phone': '7864046170',
    'employee_id': '',
    'department': 'English',
    'designation': 'teacher',
    'qualification': 'MA',
    'joining_date': '2026-05-11',
    'basic_salary': '0',
    'bank_name': '',
    'bank_account_no': ''
}

qd = QueryDict(mutable=True)
qd.update(data)

serializer = TeacherSerializer(data=qd)
is_valid = serializer.is_valid()

if not is_valid:
    print("VALIDATION FAILED:")
    print(serializer.errors)
else:
    print("VALIDATION PASSED!")
