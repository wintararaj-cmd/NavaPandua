# Testing Guide - School Management System

## 🧪 Complete Testing Checklist

### Prerequisites
- [ ] Python 3.11+ installed
- [ ] Node.js 18+ installed
- [ ] PostgreSQL 15+ installed and running
- [ ] Redis installed (optional for now)

---

## Part 1: Backend Setup & Testing

### 1.1 Install Dependencies

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
pip install -r requirements/development.txt
```

**Expected Result:** All packages install successfully without errors.

### 1.2 Configure Database

**Option A: Use SQLite (Quick Test)**
In `.env`, comment out PostgreSQL and Django will use SQLite by default:
```env
# DATABASE_URL=postgresql://...
```

**Option B: Use PostgreSQL (Recommended)**
1. Create database:
```sql
CREATE DATABASE school_mgmt_db;
CREATE USER school_user WITH PASSWORD 'school123';
GRANT ALL PRIVILEGES ON DATABASE school_mgmt_db TO school_user;
```

2. Update `.env`:
```env
DATABASE_URL=postgresql://school_user:school123@localhost:5432/school_mgmt_db
```

### 1.3 Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

**Expected Result:**
```
Operations to perform:
  Apply all migrations: accounts, admin, auth, contenttypes, core, organizations, schools, sessions
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  Applying accounts.0001_initial... OK
  ...
```

### 1.4 Create Superuser

```bash
python manage.py createsuperuser
```

**Enter:**
- Email: `admin@school.com`
- Username: `admin`
- Password: `admin123` (or your choice)

### 1.5 Create Test Data (Optional)

Create a file `backend/create_test_data.py`:

```python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import User
from apps.organizations.models import Organization, OrganizationSettings
from apps.schools.models import School, SchoolSettings

# Create test organization
admin = User.objects.get(username='admin')
org = Organization.objects.create(
    name='Test School Organization',
    subdomain='test-school',
    email='org@testschool.com',
    phone='1234567890',
    address_line1='123 Main St',
    city='Mumbai',
    state='Maharashtra',
    postal_code='400001',
    owner=admin
)

# Create organization settings
OrganizationSettings.objects.create(organization=org)

# Create test school
school = School.objects.create(
    organization=org,
    name='Test High School',
    code='THS001',
    email='info@testhighschool.com',
    phone='9876543210',
    address_line1='456 School Road',
    city='Mumbai',
    state='Maharashtra',
    postal_code='400002',
    board='CBSE',
    established_year=2000
)

# Create school settings
SchoolSettings.objects.create(school=school)

print("✓ Test data created successfully!")
print(f"Organization: {org.name}")
print(f"School: {school.name}")
```

Run it:
```bash
python create_test_data.py
```

### 1.6 Start Development Server

```bash
python manage.py runserver
```

**Expected Result:**
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

### 1.7 Test API Endpoints

**Visit these URLs in your browser:**

1. **API Documentation (Swagger)**
   - URL: http://localhost:8000/api/docs
   - Should show interactive API documentation

2. **Django Admin**
   - URL: http://localhost:8000/admin
   - Login with superuser credentials
   - Check: Users, Organizations, Schools

3. **API Schema**
   - URL: http://localhost:8000/api/schema/
   - Should return OpenAPI schema JSON

### 1.8 Test Authentication Endpoints

**Using curl or Postman:**

**Register:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test@123456",
    "password_confirm": "Test@123456",
    "first_name": "Test",
    "last_name": "User",
    "role": "STUDENT"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "user": { ... },
    "tokens": {
      "access": "eyJ...",
      "refresh": "eyJ..."
    }
  }
}
```

**Login:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@school.com",
    "password": "admin123"
  }'
```

**Get Current User:**
```bash
curl -X GET http://localhost:8000/api/v1/auth/me/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Part 2: Frontend Setup & Testing

### 2.1 Install Dependencies

```bash
cd frontend/admin-portal
npm install
```

**Expected Result:** All packages install successfully.

### 2.2 Configure Environment

```bash
copy .env.example .env  # Windows
```

Verify `.env` contains:
```env
VITE_API_URL=http://localhost:8000/api/v1
```

### 2.3 Start Development Server

```bash
npm run dev
```

**Expected Result:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 2.4 Test Frontend

**Visit:** http://localhost:5173

**Test Login Page:**
1. Should see beautiful gradient login page
2. Try logging in with superuser credentials:
   - Email: `admin@school.com`
   - Password: `admin123`

**Expected Result:**
- Toast notification: "Login successful!"
- Redirect to dashboard

**Test Dashboard:**
1. Should see sidebar with navigation
2. Should see stats cards (placeholder data)
3. Should see user profile in sidebar
4. Click "Logout" - should redirect to login

**Test Navigation:**
1. Click "Organizations" - should show placeholder page
2. Click "Schools" - should show placeholder page
3. Click "Dashboard" - should return to dashboard

---

## Part 3: Integration Testing

### 3.1 Test Full Authentication Flow

1. **Register new user via API**
2. **Login via frontend**
3. **Check user in Django admin**
4. **Update profile via frontend** (when implemented)

### 3.2 Test Organization Management

**Via Django Admin:**
1. Go to http://localhost:8000/admin
2. Create new Organization
3. Create Organization Settings
4. Verify in API: http://localhost:8000/api/v1/organizations/

**Via API:**
```bash
curl -X POST http://localhost:8000/api/v1/organizations/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New School Org",
    "subdomain": "new-school",
    "email": "info@newschool.com",
    "phone": "1234567890",
    "address_line1": "123 Street",
    "city": "Delhi",
    "state": "Delhi",
    "postal_code": "110001"
  }'
```

### 3.3 Test School Management

**Create School:**
```bash
curl -X POST http://localhost:8000/api/v1/schools/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "organization": "ORG_UUID",
    "name": "Test School",
    "code": "TS001",
    "email": "school@test.com",
    "phone": "9876543210",
    "address_line1": "School St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postal_code": "400001",
    "board": "CBSE"
  }'
```

---

## Part 4: Error Testing

### 4.1 Test Validation Errors

**Invalid Registration:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test",
    "email": "invalid-email",
    "password": "123"
  }'
```

**Expected:** Validation errors for email and password

### 4.2 Test Authentication Errors

**Login with wrong password:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@school.com",
    "password": "wrongpassword"
  }'
```

**Expected:** "Invalid credentials" error

**Access protected endpoint without token:**
```bash
curl -X GET http://localhost:8000/api/v1/auth/me/
```

**Expected:** 401 Unauthorized

---

## Part 5: Performance Testing

### 5.1 Check Response Times

All API endpoints should respond in < 500ms

### 5.2 Check Frontend Load Time

Page should load in < 2 seconds

---

## ✅ Testing Checklist

### Backend:
- [ ] Virtual environment created
- [ ] Dependencies installed
- [ ] Database configured
- [ ] Migrations run successfully
- [ ] Superuser created
- [ ] Server starts without errors
- [ ] API docs accessible
- [ ] Django admin accessible
- [ ] Registration endpoint works
- [ ] Login endpoint works
- [ ] Protected endpoints require auth
- [ ] Organization CRUD works
- [ ] School CRUD works

### Frontend:
- [ ] Dependencies installed
- [ ] Environment configured
- [ ] Dev server starts
- [ ] Login page displays correctly
- [ ] Login functionality works
- [ ] Dashboard displays
- [ ] Navigation works
- [ ] Logout works
- [ ] Toast notifications work
- [ ] Protected routes work

### Integration:
- [ ] Frontend can call backend API
- [ ] Authentication flow works end-to-end
- [ ] Token refresh works
- [ ] Error handling works
- [ ] CORS configured correctly

---

## 🐛 Common Issues & Solutions

### Issue: "Module not found"
**Solution:** Reinstall dependencies
```bash
pip install -r requirements/development.txt
```

### Issue: "Database connection failed"
**Solution:** Check PostgreSQL is running and credentials in `.env`

### Issue: "Port already in use"
**Solution:** Kill process on port
```bash
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Issue: "CORS errors in frontend"
**Solution:** Check `CORS_ALLOWED_ORIGINS` in `settings.py`

### Issue: "npm install fails"
**Solution:** Clear cache
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Expected Test Results

After completing all tests, you should have:

✅ Backend API running on port 8000
✅ Frontend running on port 5173
✅ At least 1 superuser created
✅ At least 1 organization created
✅ At least 1 school created
✅ All API endpoints responding correctly
✅ Frontend successfully communicating with backend
✅ Authentication working end-to-end

---

## 🎯 Next Steps After Testing

1. **Implement Student Module** - Full CRUD for students
2. **Implement Teacher Module** - Full CRUD for teachers
3. **Complete Frontend Pages** - Organizations and Schools
4. **Add Data Tables** - With pagination and search
5. **Implement Forms** - For creating/editing records

---

**Happy Testing! 🚀**
