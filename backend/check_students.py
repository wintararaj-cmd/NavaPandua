import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.students.models import Student
from apps.admissions.models import AdmissionApplication

print(f"Total Students: {Student.objects.count()}")
for s in Student.objects.all():
    print(f"Student: {s.user.get_full_name()} ({s.admission_number}), School: {s.school.name}")

print(f"\nTotal Admitted Applications: {AdmissionApplication.objects.filter(status='ADMITTED').count()}")
for a in AdmissionApplication.objects.filter(status='ADMITTED'):
    print(f"Application: {a.first_name} {a.last_name} ({a.application_number}), School: {a.school.name}")
