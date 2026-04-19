@echo off
echo ====================================================
echo    School Management System - Docker Starter
echo ====================================================
echo.
echo Starting all services (Postgres, Redis, Backend, Celery) via Docker...
echo.

docker-compose up -d

echo.
echo ====================================================
echo Services are starting in the background.
echo Use 'docker-compose logs -f' to see logs.
echo ====================================================
echo.
pause
