import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import User
from apps.students.models import Student
from apps.admissions.models import AdmissionApplication

app_no = "REG-2026-925793"
username = f"app_{app_no.lower()}"

print(f"Checking for username: {username}")
user = User.objects.filter(username=username).first()
if user:
    print(f"User found: {user.id}, Role: {user.role}, Email: {user.email}")
    student = Student.objects.filter(user=user).first()
    if student:
        print(f"Student found: {student.id}, Admission No: {student.admission_number}")
    else:
        print("Student NOT found for this user.")
else:
    print("User NOT found.")

app = AdmissionApplication.objects.filter(application_number=app_no).first()
if app:
    print(f"Application status: {app.status}")
