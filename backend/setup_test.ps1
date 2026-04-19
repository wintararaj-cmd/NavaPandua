# Setup and Test Script for School Management System
# Run this after installing dependencies

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "School Management System - Setup Test" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if virtual environment is activated
if ($env:VIRTUAL_ENV) {
    Write-Host "✓ Virtual environment is activated" -ForegroundColor Green
}
else {
    Write-Host "✗ Virtual environment is NOT activated" -ForegroundColor Red
    Write-Host "  Please run: .\venv\Scripts\activate" -ForegroundColor Yellow
    exit 1
}

# Check if .env file exists
if (Test-Path ".env") {
    Write-Host "✓ .env file exists" -ForegroundColor Green
}
else {
    Write-Host "✗ .env file not found" -ForegroundColor Red
    Write-Host "  Creating from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "  Please update .env with your database credentials" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 1: Creating migrations..." -ForegroundColor Cyan
python manage.py makemigrations

Write-Host ""
Write-Host "Step 2: Running migrations..." -ForegroundColor Cyan
python manage.py migrate

Write-Host ""
Write-Host "Step 3: Creating required directories..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "logs" | Out-Null
New-Item -ItemType Directory -Force -Path "media" | Out-Null
New-Item -ItemType Directory -Force -Path "static" | Out-Null
Write-Host "✓ Directories created" -ForegroundColor Green

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Create superuser: python manage.py createsuperuser" -ForegroundColor White
Write-Host "2. Start server: python manage.py runserver" -ForegroundColor White
Write-Host "3. Visit: http://localhost:8000/api/docs" -ForegroundColor White
Write-Host ""
