# IT Staff Documentation - School Management System

This document provides technical details for the internal IT staff of the organization to maintain, optimize, and secure the School Management System.

## Architectural Overview
- **Backend**: Django REST Framework (Python)
- **Frontend**: React (TypeScript, Vite)
- **Database**: PostgreSQL
- **Caching/Queue**: Redis
- **Containerization**: Docker & Docker Compose

## Performance Optimization
### 1. Database Indexing
Critical indexes have been added to high-volume tables:
- `students`: Index on `roll_number` and composite `(school, current_class, section)`.
- `student_attendance` / `teacher_attendance`: Index on `date` and composite `(school, date, status)`.
- `fee_allocations`: Index on `status`, `due_date`.
- `fee_payments`: Index on `payment_date`.
- `teachers`: Index on `employee_id`.

### 2. Caching Strategy
The application uses **Redis** for:
- API Response Caching
- Session Management (`SESSION_ENGINE = 'django.contrib.sessions.backends.cache'`)
- Background tasks (Celery broker)

### 3. Database Connection Pooling
`DATABASES` setting in `config/settings.py` includes `conn_max_age=600` for connection reuse.

## Security Controls
### 1. Role-Based Access Control (RBAC)
Custom permissions are defined in `apps/accounts/permissions.py`:
- `IsSuperAdmin`: Full system access.
- `IsSchoolAdmin`: Access to specific school branch data.
- `IsTeacher`: Academic management access.
- `IsStudent`: Personal data access.
- `IsAdminOrTeacher`: Shared academic management.

### 2. Data Isolation (Multi-School)
All ViewSets inherit from `SchoolFilterMixin` (`apps/core/mixins.py`), which automatically:
- Filters every QuerySet by the logged-in user's `school_id`.
- Auto-assigns the correct `school` on object creation.
- Prevents cross-school data leaks.

### 3. Environment Variables
Sensitive keys (SECRET_KEY, DB_URL, RAZORPAY_KEYS, TWILIO_KEYS) MUST be stored in a `.env` file and NOT committed to version control.

## Maintenance Procedures
### 1. Backups
Internal IT should schedule daily PostgreSQL dumps:
```bash
pg_dump -U postgres school_mgmt_db > backup_$(date +%Y%m%d).sql
```

### 2. Logs
System logs are located in `backend/logs/django.log`. Log rotation should be configured via OS-level `logrotate` for production.

### 3. Module Maintenance
| Module | Key Operations |
|--------|----------------|
| **Fees** | Monitor Razorpay webhook logs for verification failures. Check `fee_allocations` for overdue entries. |
| **Exams** | Ensure PDF report card generation service has sufficient memory for processing large batches. |
| **Attendance** | Check Celery Beat logs for daily attendance summary generation. |
| **Notifications** | Monitor SMS/Email queue in Redis (`CELERY_BROKER_URL`). |

## 🚀 Deployment Workflow (Production)
The system is optimized for deployment via **Coolify** on an Ubuntu VPS.

### 1. Initial Setup
1. Provision Ubuntu 22.04+ VPS with at least 4GB RAM.
2. Install Coolify: `curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash`.
3. Connect GitHub Repository: `wintararaj-cmd/NavaPandua`.

### 2. Resource Configuration
- **Backend**: Use the root `docker-compose.yml`. Set `DATABASE_URL` and `REDIS_URL`.
- **Admin Portal**: Set base directory to `/frontend/admin-portal`. Build command: `npm run build`.
- **Landing Page**: Set base directory to `/frontend/landing-page`. Build command: `npm run build`.

### 3. Post-Deployment Commands
Run these inside the backend container terminal:
```bash
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser  # If initial setup
```

## 🚨 Troubleshooting
| Issue | Potential Cause | Solution |
|-------|-----------------|----------|
| **503 Service Unavailable** | Backend container down or proxy routing error. | Check `docker ps` and Coolify logs. |
| **CORS Errors** | `CORS_ALLOWED_ORIGINS` mismatch in `.env`. | Verify frontend URL (including https://) is in the list. |
| **Database Connection Error** | Postgres service not started or wrong credentials. | Verify `DATABASE_URL` matches the internal Docker service name. |
| **Static Files Missing** | `collectstatic` not run after update. | Run `python manage.py collectstatic --noinput`. |

## Continuous Monitoring
Consider implementing:
- **Prometheus/Grafana**: For system metrics.
- **Sentry**: For real-time error tracking.
- **Checkly**: For monitoring critical API endpoints (Login, Fee Payment).
