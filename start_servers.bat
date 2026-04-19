@echo off
SETLOCAL EnableDelayedExpansion

echo ====================================================
echo    School Management System - Server Starter
echo ====================================================
echo.

:: Get the current directory
set "PROJECT_ROOT=%~dp0"

:: 1. Start Backend Server
echo [1/3] Starting Django Backend...
start "Django Backend" cmd /k "cd /d %PROJECT_ROOT%backend && echo Activating Virtual Environment... && call .\venv\Scripts\activate && echo Starting Server... && python manage.py runserver"

:: 2. Start Frontend Server
echo [2/3] Starting React Frontend (Admin Portal)...
start "React Frontend" cmd /k "cd /d %PROJECT_ROOT%frontend\admin-portal && echo Starting Vite Dev Server... && npm run dev"

:: 3. Check for Redis/Celery (Optional but recommended if services depend on it)
echo [3/3] Optional Services...
echo.
echo TIP: If you need Celery workers, run the following in a new terminal:
echo cd backend ^& .\venv\Scripts\activate ^& celery -A config worker -l info
echo.
echo TIP: To start infrastructure via Docker (Postgres, Redis):
echo docker-compose up -d postgres redis
echo.

echo ====================================================
echo Servers are being initialized in separate windows.
echo ====================================================
echo.
pause
