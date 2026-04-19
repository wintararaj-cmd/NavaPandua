# Create stub apps script
# Run this to create placeholder apps

$apps = @('teachers', 'classes', 'subjects', 'admissions', 'fees', 'exams', 'attendance', 'live_classes', 'assignments', 'library', 'timetable', 'notifications', 'analytics')

foreach ($app in $apps) {
    $appPath = "backend/apps/$app"
    New-Item -ItemType Directory -Force -Path $appPath | Out-Null
    
    # Create __init__.py
    New-Item -ItemType File -Force -Path "$appPath/__init__.py" | Out-Null
    
    # Create apps.py
    $appsContent = @"
from django.apps import AppConfig

class $($app.Substring(0,1).ToUpper() + $app.Substring(1))Config(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.$app'
"@
    Set-Content -Path "$appPath/apps.py" -Value $appsContent
    
    # Create urls.py
    $urlsContent = @"
from django.urls import path
app_name = '$app'
urlpatterns = []
"@
    Set-Content -Path "$appPath/urls.py" -Value $urlsContent
}

Write-Host "Stub apps created successfully!"
