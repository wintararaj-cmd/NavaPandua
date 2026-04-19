# School Management System

A comprehensive, multi-tenant School Management System built with Django, PostgreSQL, React, and React Native.

## 🎯 Features

- **Multi-Tenant Architecture**: Manage multiple schools under one organization
- **Student Lifecycle Management**: From admission to graduation
- **Fee Management**: Complete financial tracking with payment gateway integration
- **Academic Management**: Exams, results, report cards, and grading
- **Attendance System**: Real-time attendance tracking with notifications
- **Live Classes**: Integrated virtual classroom with video conferencing
- **Assignment Management**: Homework submission and grading system
- **Analytics & Reports**: Comprehensive dashboards and custom reports
- **Mobile Apps**: Native apps for students and parents
- **Notification System**: Email, SMS, and push notifications

## 🏗️ Tech Stack

### Backend
- **Framework**: Django 4.2+ with Python 3.11+
- **API**: Django REST Framework with JWT authentication
- **Database**: PostgreSQL 15+
- **Caching**: Redis
- **Task Queue**: Celery with Celery Beat
- **WebSocket**: Django Channels
- **API Documentation**: drf-spectacular (OpenAPI/Swagger)

### Frontend
- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Data Fetching**: React Query (TanStack Query)
- **Routing**: React Router v6
- **Charts**: Recharts
- **HTTP Client**: Axios

### Mobile
- **Framework**: React Native with TypeScript
- **Navigation**: React Navigation
- **UI**: React Native Paper
- **Push Notifications**: Firebase Cloud Messaging

### DevOps
- **Containerization**: Docker & Docker Compose
- **Deployment**: Coolify
- **Web Server**: Nginx
- **SSL**: Let's Encrypt
- **CI/CD**: GitHub Actions

## 📋 Project Structure

```
school-management-system/
├── backend/                    # Django Project
│   ├── config/                 # Settings & config
│   ├── apps/
│   │   ├── core/               # Shared utilities
│   │   ├── accounts/           # User management
│   │   ├── organizations/      # Multi-tenant org
│   │   ├── schools/            # School management
│   │   ├── students/           # Student module
│   │   ├── teachers/           # Teacher module
│   │   ├── classes/            # Class management
│   │   ├── subjects/           # Subject management
│   │   ├── admissions/         # Admission system
│   │   ├── fees/               # Fee management
│   │   ├── exams/              # Exam & results
│   │   ├── attendance/         # Attendance tracking
│   │   ├── live_classes/       # Virtual classroom
│   │   ├── assignments/        # Homework system
│   │   ├── library/            # Digital library
│   │   ├── timetable/          # Schedule management
│   │   ├── notifications/      # Email/SMS/Push
│   │   └── analytics/          # Reports & insights
│   └── api/v1/
├── frontend/
│   ├── admin-portal/           # Organization admin
│   ├── school-portal/          # School staff interface
│   └── shared/                 # Shared components
└── mobile/
    └── student-app/            # Student mobile app
```

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Redis
- Git

### Backend Setup

```bash
# Clone repository
git clone <repository-url>
cd school-management-system

# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements/development.txt

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

### Frontend Setup

```bash
# Navigate to admin portal
cd frontend/admin-portal

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with API URL

# Start development server
npm run dev
```

### Docker Setup (Recommended)

```bash
# Start all services
docker-compose up -d

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser
```

## 🔐 User Roles

1. **Super Admin** - Organization owner
2. **School Admin** - School principal/administrator
3. **Teacher** - Subject teacher
4. **Student** - Student account
5. **Parent** - Parent/Guardian account
6. **Accountant** - Finance staff
7. **Librarian** - Library staff
8. **Receptionist** - Front desk

## 📚 Documentation

- [API Documentation](http://localhost:8000/api/docs) - Swagger/OpenAPI
- [Architecture Guide](docs/architecture.md)
- [Deployment Guide](docs/deployment.md)
- [User Manual](docs/user-manual.md)
- [Developer Guide](docs/developer-guide.md)

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend/admin-portal
npm test

# E2E tests
npm run test:e2e
```

## 📊 Database Schema

See [Database Schema Documentation](docs/database-schema.md) for detailed information.

## 🔒 Security

- HTTPS everywhere
- JWT authentication with refresh tokens
- Role-based access control (RBAC)
- Input validation and sanitization
- SQL injection prevention (ORM)
- XSS prevention
- CSRF protection
- Rate limiting
- Audit logging

## 🎯 Development Phases

- [x] Phase 1: Foundation (Weeks 1-3)
- [ ] Phase 2: Core Modules (Weeks 4-8)
- [ ] Phase 3: Financial & Academic (Weeks 9-12)
- [ ] Phase 4: Attendance & Communication (Weeks 13-16)
- [ ] Phase 5: Live Classes & Advanced (Weeks 17-20)
- [ ] Phase 6: Mobile App (Weeks 21-24)
- [ ] Phase 7: Analytics & Reports (Weeks 25-27)
- [ ] Phase 8: Testing & Deployment (Weeks 28-30)

## 📞 Support

- Email: support@yourschool.com
- Website: https://yourschool.com
- Documentation: https://docs.yourschool.com

## 📄 License

[Specify your license here]

## 👥 Contributors

See [CONTRIBUTORS.md](CONTRIBUTORS.md)

## 🙏 Acknowledgments

Built with modern technologies and best practices for educational institutions.
