@echo off
SETLOCAL EnableDelayedExpansion

:menu
cls
echo ====================================================
echo    School Management System - Master Control
echo ====================================================
echo.
echo  [1] Start Native Development Servers (Backend + Frontend)
echo  [2] Start Docker Infrastructure (Postgres + Redis)
echo  [3] Start Everything via Docker (All Services)
echo  [4] Start Celery Worker (Native)
echo  [5] Apply Database Migrations (Backend)
echo  [6] Exit
echo.
set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto native
if "%choice%"=="2" goto docker_infra
if "%choice%"=="3" goto docker_all
if "%choice%"=="4" goto celery
if "%choice%"=="5" goto migrate
if "%choice%"=="6" exit
goto menu

:native
echo Starting Native Development Servers...
start "Django Backend" cmd /k "cd /d %~dp0backend && echo Activating venv... && call .\venv\Scripts\activate && echo Starting Django... && python manage.py runserver"
start "React Frontend" cmd /k "cd /d %~dp0frontend\admin-portal && echo Starting Vite... && npm run dev"
echo Servers are starting in separate windows.
pause
goto menu

:docker_infra
echo Starting Postgres and Redis via Docker...
docker-compose up -d postgres redis
echo Infrastructure services are running.
pause
goto menu

:docker_all
echo Starting All Services via Docker...
docker-compose up -d
echo All services are starting in the background.
pause
goto menu

:celery
echo Starting Celery Worker...
start "Celery Worker" cmd /k "cd /d %~dp0backend && echo Activating venv... && call .\venv\Scripts\activate && echo Starting Celery... && celery -A config worker -l info"
pause
goto menu

:migrate
echo Applying Database Migrations...
cmd /c "cd /d %~dp0backend && call .\venv\Scripts\activate && python manage.py migrate"
echo.
echo Migrations complete.
pause
goto menu
