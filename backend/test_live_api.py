import requests
import json

url = "https://api.navadaya.in/api/v1/teachers/"

headers = {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzc4NDkzNzg1LCJpYXQiOjE3Nzg0OTAxODUsImp0aSI6ImViOTI3MmNiNDRhNDRlMWFhODIzM2UxZDRkZGQwZjUwIiwidXNlcl9pZCI6NzJ9.QnSDAXRXll3KDQDu0xNKnDXUkVzAUraOte7jp1pyvQo",
    "Accept": "application/json"
}

data = {
    "first_name": "Test",
    "last_name": "Teacher",
    "email": "test.api.999@gmail.com",
    "phone": "9999999999",
    "gender": "MALE",
    "role": "TEACHER",
    "department": "Science",
    "designation": "teacher",
    "qualification": "MSc",
    "joining_date": "2026-05-11",
    "basic_salary": 0
}

response = requests.post(url, data=data, headers=headers)
print("STATUS:", response.status_code)
print("RESPONSE:", response.text)
