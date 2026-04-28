import os
import django
import sys

# Add the current directory to sys.path
sys.path.append(os.getcwd())

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.admissions.models import AdmissionApplication
from django.forms.models import model_to_dict
import json

try:
    app = AdmissionApplication.objects.get(id='4c578eb4-93c5-4850-8adc-b2d5ca09acfa')
    print("Application Found:")
    print(json.dumps(model_to_dict(app), indent=2, default=str))
except Exception as e:
    print(f"Error: {e}")
