import os
import django
import sys

# Add the current directory to sys.path
sys.path.append(os.getcwd())

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.conf import settings
settings.ALLOWED_HOSTS.append('testserver')
from rest_framework.test import APIClient
from apps.admissions.models import AdmissionApplication
from apps.accounts.models import User
from django.forms.models import model_to_dict

# Get a superuser for auth
user = User.objects.filter(is_superuser=True).first()

client = APIClient()
client.force_authenticate(user=user)

app_id = '4c578eb4-93c5-4850-8adc-b2d5ca09acfa'
app = AdmissionApplication.objects.get(id=app_id)

# Prepare payload like the frontend
payload = model_to_dict(app)

# Cleanup like frontend does
read_only = ['id', 'created_at', 'updated_at', 'application_number', 'photo', 'father_photo', 'mother_photo']
for field in read_only:
    if field in payload:
        del payload[field]

# Specific cleaning from ApplicationModal.tsx
if 'enquiry' in payload:
    del payload['enquiry']

# Ensure decimals are strings (like in JSON)
if payload.get('father_income'):
    payload['father_income'] = str(payload['father_income'])

response = client.patch(f'/api/v1/admissions/applications/{app_id}/', payload, format='json')

print(f"Status Code: {response.status_code}")
if response.status_code != 200:
    print("Response Data:")
    print(response.json())
else:
    print("Success")
