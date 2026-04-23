@echo off
SETLOCAL EnableDelayedExpansion

:menu
cls
color 0B
echo ====================================================
echo    SCHOOL MANAGEMENT SYSTEM - MASTER CONTROL
echo ====================================================
echo.
echo  [1] Start Native Development Servers (Backend + Frontend)
echo  [2] Start Docker Infrastructure (Postgres + Redis)
echo  [3] Start Everything via Docker (All Services)
echo  [4] Start Celery Worker (Native)
echo  [5] Run Database Migrations (Backend)
echo  [6] Create Superuser (Admin Account)
echo  [7] Populate Initial Sample Data
echo  [8] Install/Update Dependencies (Backend + Frontend)
echo  [9] Exit
echo.
echo ====================================================
set /p choice="Enter your choice (1-9): "

if "%choice%"=="1" goto native
if "%choice%"=="2" goto docker_infra
if "%choice%"=="3" goto docker_all
if "%choice%"=="4" goto celery
if "%choice%"=="5" goto migrate
if "%choice%"=="6" goto superuser
if "%choice%"=="7" goto populate
if "%choice%"=="8" goto install
if "%choice%"=="9" exit
goto menu

:native
echo.
echo Starting Native Development Servers...
echo ----------------------------------------------------
start "Django Backend" cmd /k "cd /d %~dp0backend && echo Activating venv... && call .\venv\Scripts\activate && echo Starting Django Server... && python manage.py runserver"
start "Admin Portal" cmd /k "cd /d %~dp0frontend\admin-portal && echo Starting Vite (Admin)... && npm run dev"
start "Landing Page" cmd /k "cd /d %~dp0frontend\landing-page && echo Starting Vite (Landing)... && npm run dev"
echo.
echo Servers are starting in separate windows.
echo - Backend: http://localhost:8000
echo - Admin:   http://localhost:5173
echo - Landing: http://localhost:5175
echo.
pause
goto menu

:docker_infra
echo.
echo Starting Postgres and Redis via Docker...
echo ----------------------------------------------------
docker-compose up -d postgres redis
echo.
echo Infrastructure services are running.
pause
goto menu

:docker_all
echo.
echo Starting All Services via Docker...
echo ----------------------------------------------------
docker-compose up -d
echo.
echo All services are starting in the background.
pause
goto menu

:celery
echo.
echo Starting Celery Worker...
echo ----------------------------------------------------
start "Celery Worker" cmd /k "cd /d %~dp0backend && echo Activating venv... && call .\venv\Scripts\activate && echo Starting Celery... && celery -A config worker -l info"
echo.
echo Celery worker starting in a separate window.
pause
goto menu

:migrate
echo.
echo Applying Database Migrations...
echo ----------------------------------------------------
cmd /c "cd /d %~dp0backend && call .\venv\Scripts\activate && python manage.py migrate"
echo.
echo Migrations complete.
pause
goto menu

:superuser
echo.
echo Creating Django Superuser...
echo ----------------------------------------------------
cmd /c "cd /d %~dp0backend && call .\venv\Scripts\activate && python manage.py createsuperuser"
echo.
pause
goto menu

:populate
echo.
echo Populating Initial Sample Data...
echo ----------------------------------------------------
cmd /c "cd /d %~dp0backend && call .\venv\Scripts\activate && python populate_data.py"
echo.
echo Data population complete.
pause
goto menu

:install
echo.
echo Installing Dependencies...
echo ----------------------------------------------------
echo [1/3] Backend Dependencies...
cmd /c "cd /d %~dp0backend && call .\venv\Scripts\activate && python -m pip install -r requirements/development.txt"
echo.
echo [2/3] Admin Portal Dependencies...
cmd /c "cd /d %~dp0frontend\admin-portal && npm install"
echo.
echo [3/3] Landing Page Dependencies...
cmd /c "cd /d %~dp0frontend\landing-page && npm install"
echo.
echo All dependencies updated.
pause
goto menu
