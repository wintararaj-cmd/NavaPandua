import os
import django

# Set up Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.accounts.models import User
from apps.teachers.models import Teacher
from apps.schools.models import School
from apps.teachers.serializers import TeacherSerializer
from django.http import QueryDict

try:
    school = School.objects.create(name='Test School')
    user = User.objects.create_user(username='teacher1', email='teacher1@gmail.com', password='test')
    # Create a teacher with empty employee_id
    Teacher.objects.create(user=user, school=school, employee_id='', department='Math', designation='T', qualification='BA', joining_date='2026-05-11')
except Exception as e:
    print(f"Setup error: {e}")

data = {
    'first_name': 'Sheikh',
    'last_name': 'Kajol',
    'gender': 'MALE',
    'role': 'TEACHER',
    'email': 'new.teacher@gmail.com', # unique email
    'phone': '7864046170',
    'employee_id': '', # The empty string again
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
