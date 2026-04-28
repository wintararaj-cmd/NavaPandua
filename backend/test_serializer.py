import os
import django
import sys

# Add the current directory to sys.path
sys.path.append(os.getcwd())

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.admissions.models import AdmissionApplication
from apps.admissions.serializers import AdmissionApplicationSerializer
from django.forms.models import model_to_dict

app_id = '4c578eb4-93c5-4850-8adc-b2d5ca09acfa'
app = AdmissionApplication.objects.get(id=app_id)

# Prepare payload like the frontend
payload = model_to_dict(app)

# Cleanup like frontend does
read_only = ['id', 'created_at', 'updated_at', 'application_number', 'photo', 'father_photo', 'mother_photo']
for field in read_only:
    if field in payload:
        del payload[field]

if 'enquiry' in payload:
    del payload['enquiry']

if payload.get('father_income'):
    payload['father_income'] = str(payload['father_income'])

serializer = AdmissionApplicationSerializer(app, data=payload, partial=True)
if serializer.is_valid():
    print("Serializer is VALID")
else:
    print("Serializer is INVALID")
    print("Errors:")
    print(serializer.errors)
