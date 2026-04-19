---
description: Setup School Management System Project
---

# School Management System - Setup Workflow

## Phase 1: Foundation Setup (Current Phase)

### Step 1: Create Project Structure
Create the complete directory structure for backend, frontend, and mobile applications.

### Step 2: Backend Setup
// turbo
```bash
cd backend
python -m venv venv
```

### Step 3: Activate Virtual Environment
**Windows:**
```bash
cd backend
.\venv\Scripts\activate
```

**Linux/Mac:**
```bash
cd backend
source venv/bin/activate
```

### Step 4: Install Backend Dependencies
// turbo
```bash
cd backend
pip install -r requirements/development.txt
```

### Step 5: Setup Environment Variables
Copy `.env.example` to `.env` and configure database settings.

### Step 6: Run Database Migrations
// turbo
```bash
cd backend
python manage.py migrate
```

### Step 7: Create Superuser
```bash
cd backend
python manage.py createsuperuser
```

### Step 8: Start Backend Server
// turbo
```bash
cd backend
python manage.py runserver
```

### Step 9: Frontend Setup
// turbo
```bash
cd frontend/admin-portal
npm install
```

### Step 10: Start Frontend Development Server
// turbo
```bash
cd frontend/admin-portal
npm run dev
```

## Access Points
- Backend API: http://localhost:8000
- Admin Panel: http://localhost:8000/admin
- Frontend: http://localhost:3000
- API Docs: http://localhost:8000/api/docs
