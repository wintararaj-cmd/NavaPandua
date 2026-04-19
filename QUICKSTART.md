# Quick Start Guide - School Management System

This guide will help you set up and run the School Management System on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.11+** - [Download](https://www.python.org/downloads/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **PostgreSQL 15+** - [Download](https://www.postgresql.org/download/)
- **Redis** - [Download](https://redis.io/download)
- **Git** - [Download](https://git-scm.com/downloads/)

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd SchoolMgmtShankar
```

## Step 2: Backend Setup

### 2.1 Create Virtual Environment

**Windows:**
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
```

**Linux/Mac:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

### 2.2 Install Dependencies

```bash
pip install -r requirements/development.txt
```

### 2.3 Setup PostgreSQL Database

1. Open PostgreSQL command line or pgAdmin
2. Create a new database:

```sql
CREATE DATABASE school_mgmt_db;
CREATE USER school_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE school_mgmt_db TO school_user;
```

### 2.4 Configure Environment Variables

1. Copy the example environment file:

```bash
copy .env.example .env  # Windows
cp .env.example .env    # Linux/Mac
```

2. Edit `.env` file and update the following:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_URL=postgresql://school_user:your_password@localhost:5432/school_mgmt_db
REDIS_URL=redis://localhost:6379/0
```

### 2.5 Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 2.6 Create Superuser

```bash
python manage.py createsuperuser
```

Follow the prompts to create an admin account.

### 2.7 Create Required Directories

```bash
mkdir logs
mkdir media
mkdir static
```

### 2.8 Start Development Server

```bash
python manage.py runserver
```

The backend API will be available at: **http://localhost:8000**

### 2.9 Access Admin Panel

Visit: **http://localhost:8000/admin**

Login with the superuser credentials you created.

### 2.10 View API Documentation

Visit: **http://localhost:8000/api/docs**

This provides interactive Swagger documentation for all API endpoints.

## Step 3: Start Redis (Required for Celery)

**Windows:**
```bash
# If installed via MSI installer
redis-server

# If using WSL
wsl redis-server
```

**Linux:**
```bash
sudo service redis-server start
```

**Mac:**
```bash
brew services start redis
```

## Step 4: Start Celery Worker (Optional - for background tasks)

Open a new terminal, activate the virtual environment, and run:

```bash
cd backend
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

celery -A config worker -l info
```

## Step 5: Start Celery Beat (Optional - for scheduled tasks)

Open another terminal, activate the virtual environment, and run:

```bash
cd backend
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

celery -A config beat -l info
```

## Step 6: Frontend Setup (Coming Soon)

The frontend setup will be added once the React application is created.

```bash
cd frontend/admin-portal
npm install
npm run dev
```

## Troubleshooting

### Database Connection Error

**Error:** `could not connect to server`

**Solution:**
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env file
- Verify database credentials

### Redis Connection Error

**Error:** `Error connecting to Redis`

**Solution:**
- Ensure Redis is running: `redis-cli ping` (should return PONG)
- Check REDIS_URL in .env file

### Import Errors

**Error:** `ModuleNotFoundError`

**Solution:**
- Ensure virtual environment is activated
- Reinstall dependencies: `pip install -r requirements/development.txt`

### Migration Errors

**Error:** `No changes detected` or migration conflicts

**Solution:**
```bash
# Delete all migration files except __init__.py
# Then run:
python manage.py makemigrations
python manage.py migrate
```

### Port Already in Use

**Error:** `Error: That port is already in use`

**Solution:**
```bash
# Use a different port
python manage.py runserver 8001

# Or kill the process using port 8000
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:8000 | xargs kill -9
```

## Useful Commands

### Django Management Commands

```bash
# Create new app
python manage.py startapp app_name

# Make migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver

# Collect static files
python manage.py collectstatic

# Run Django shell
python manage.py shell

# Run tests
python manage.py test

# Or use pytest
pytest
```

### Database Commands

```bash
# Show migrations
python manage.py showmigrations

# SQL for migration
python manage.py sqlmigrate app_name migration_number

# Reset database (careful!)
python manage.py flush
```

### Celery Commands

```bash
# Start worker
celery -A config worker -l info

# Start beat scheduler
celery -A config beat -l info

# Start both worker and beat
celery -A config worker -B -l info

# Purge all tasks
celery -A config purge
```

## Next Steps

1. **Explore the API**: Visit http://localhost:8000/api/docs
2. **Create Organizations**: Use the admin panel or API
3. **Add Schools**: Create schools under organizations
4. **Add Users**: Create teachers, students, etc.
5. **Configure Settings**: Customize organization and school settings

## Development Workflow

1. **Create a new branch** for your feature
2. **Make changes** to the code
3. **Run tests** to ensure everything works
4. **Commit changes** with descriptive messages
5. **Push to repository** and create a pull request

## Getting Help

- **Documentation**: See `/docs` folder
- **API Docs**: http://localhost:8000/api/docs
- **Issues**: Create an issue on GitHub
- **Email**: support@yourschool.com

## Project Structure

```
SchoolMgmtShankar/
├── backend/                    # Django backend
│   ├── apps/                   # Django apps
│   │   ├── accounts/           # User authentication
│   │   ├── organizations/      # Organization management
│   │   ├── schools/            # School management
│   │   ├── students/           # Student management
│   │   └── ...                 # Other modules
│   ├── config/                 # Django configuration
│   ├── requirements/           # Python dependencies
│   ├── manage.py               # Django management script
│   └── .env                    # Environment variables
├── frontend/                   # React frontends
│   ├── admin-portal/           # Admin interface
│   └── school-portal/          # School interface
├── mobile/                     # React Native app
│   └── student-app/            # Student mobile app
└── docs/                       # Documentation
```

## Important Notes

- **Never commit `.env` file** - It contains sensitive information
- **Always activate virtual environment** before running Python commands
- **Run migrations** after pulling new code
- **Keep dependencies updated** regularly
- **Write tests** for new features
- **Follow code style guidelines** (PEP 8 for Python)

## Security Reminders

- Change `SECRET_KEY` in production
- Set `DEBUG=False` in production
- Use strong passwords for database and admin accounts
- Enable HTTPS in production
- Regularly update dependencies
- Review security settings before deployment

---

**Happy Coding! 🚀**

For detailed documentation, see the [Full Documentation](docs/README.md)
