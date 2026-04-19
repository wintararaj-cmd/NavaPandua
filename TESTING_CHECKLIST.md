# Testing Checklist - School Management System

## 🚀 Quick Start Guide

### Prerequisites
- Frontend is running at http://localhost:5173 ✅
- Backend needs to be started

---

## Step 1: Start Backend Server

```bash
cd backend

# Run migrations for subjects app
python manage.py makemigrations subjects
python manage.py migrate

# Start Django server
python manage.py runserver
```

**Expected Output:**
```
Starting development server at http://127.0.0.1:8000/
```

---

## Step 2: Login to Admin Portal

1. Open browser: http://localhost:5173
2. Login with demo credentials:
   - **Email:** `admin@school.com`
   - **Password:** `admin123`

---

## Step 3: Test Each Module

### ✅ Dashboard
- [ ] Dashboard loads successfully
- [ ] Statistics cards display
- [ ] Charts render correctly

### ✅ Organizations
- [ ] List organizations
- [ ] Create new organization
- [ ] Edit organization
- [ ] Delete organization

### ✅ Schools
- [ ] List schools
- [ ] Create new school
- [ ] Edit school
- [ ] Delete school

### ✅ Admissions
- [ ] List enquiries
- [ ] Create new enquiry
- [ ] Edit enquiry
- [ ] Change status (observe color changes)
- [ ] Delete enquiry
- [ ] Search enquiries

**Status Colors:**
- 🔵 NEW - Blue
- 🟡 CONTACTED - Yellow
- 🟣 VISITED - Purple
- 🟢 APPLICATION_PURCHASED - Green
- ⚫ CLOSED - Gray

### ✅ Students
- [ ] List students
- [ ] Click "Add Student"
- [ ] Test cascading dropdowns:
  - [ ] Select Organization
  - [ ] School dropdown auto-loads
  - [ ] Select School
  - [ ] Class dropdown auto-loads
  - [ ] Select Class
  - [ ] Section dropdown auto-loads
- [ ] Fill all required fields:
  - [ ] Admission Number
  - [ ] Admission Date
  - [ ] Student Name
  - [ ] Date of Birth
  - [ ] Gender
  - [ ] Father's Name & Phone
  - [ ] Mother's Name & Phone
- [ ] Fill optional fields
- [ ] Create student
- [ ] Edit student
- [ ] Delete student
- [ ] Search students

### ✅ Teachers
- [ ] List teachers
- [ ] Create new teacher
- [ ] Edit teacher
- [ ] Delete teacher
- [ ] Search teachers

### ✅ Classes & Sections
- [ ] List classes
- [ ] Create new class
- [ ] Click chevron to expand class
- [ ] View sections (should be empty initially)
- [ ] Click "Add Section"
- [ ] Create section with:
  - [ ] Section name (e.g., "A")
  - [ ] Class teacher (optional)
  - [ ] Room number (optional)
  - [ ] Capacity (default: 40)
- [ ] Create multiple sections (A, B, C)
- [ ] View section cards
- [ ] Edit section
- [ ] Delete section
- [ ] Edit class
- [ ] Delete class (confirm it deletes sections too)

**Visual Checks:**
- [ ] Class code badge (indigo)
- [ ] Section badges (purple circles)
- [ ] Section cards display properly
- [ ] Expand/collapse works smoothly

### ✅ Subjects
- [ ] List subjects
- [ ] Create new subject
- [ ] Test subject types:
  - [ ] Theory (blue badge)
  - [ ] Practical (green badge)
  - [ ] Both (purple badge)
- [ ] Edit subject
- [ ] Change subject type
- [ ] Delete subject
- [ ] Search subjects

**Visual Checks:**
- [ ] Book icon displays
- [ ] Code badge (gray)
- [ ] Type badge colors correct

---

## Step 4: UI/UX Testing

### Navigation
- [ ] Sidebar menu displays all items
- [ ] Sidebar toggle works
- [ ] All menu items clickable
- [ ] Active page highlighted

### Responsive Design
- [ ] Test on desktop (1920x1080)
- [ ] Test on tablet (768px width)
- [ ] Test on mobile (375px width)
- [ ] Tables scroll horizontally on small screens
- [ ] Modals display properly on all sizes

### Interactions
- [ ] Hover effects work
- [ ] Buttons change on hover
- [ ] Loading spinners display during API calls
- [ ] Toast notifications appear
- [ ] Confirmation dialogs work
- [ ] Forms validate required fields

---

## Step 5: Functionality Testing

### CRUD Operations
For each module, verify:
- [ ] **Create:** New records save successfully
- [ ] **Read:** Lists display all records
- [ ] **Update:** Edits save correctly
- [ ] **Delete:** Records delete with confirmation

### Search Functionality
- [ ] Search works in Students
- [ ] Search works in Admissions
- [ ] Search works in Classes
- [ ] Search works in Subjects
- [ ] Search results update in real-time

### Data Validation
- [ ] Required fields show error if empty
- [ ] Email validation works
- [ ] Phone number format accepted
- [ ] Date pickers work correctly
- [ ] Dropdowns populate correctly

---

## Step 6: Error Handling

### Test Error Scenarios
- [ ] Submit form with missing required fields
- [ ] Try to delete item with dependencies
- [ ] Test with invalid data
- [ ] Check console for errors
- [ ] Verify error messages display

### Network Errors
- [ ] Stop backend server
- [ ] Try to load a page
- [ ] Verify error message displays
- [ ] Restart backend
- [ ] Verify app recovers

---

## Step 7: Performance Testing

### Load Times
- [ ] Dashboard loads quickly
- [ ] Lists load within 2 seconds
- [ ] Modals open instantly
- [ ] Search results appear quickly

### Smooth Interactions
- [ ] No lag when typing
- [ ] Dropdowns respond immediately
- [ ] Page transitions smooth
- [ ] No flickering or jumps

---

## Common Issues & Solutions

### Issue: Backend Connection Refused
**Solution:**
```bash
cd backend
python manage.py runserver
```

### Issue: Login Fails
**Solution:**
1. Check backend is running
2. Verify credentials: `admin@school.com` / `admin123`
3. Check browser console for errors

### Issue: Dropdowns Empty
**Solution:**
1. Ensure parent data exists (e.g., create Organization before School)
2. Check backend API responses
3. Verify data in Django admin

### Issue: 404 on API Calls
**Solution:**
1. Check `backend/config/urls.py` includes all app URLs
2. Verify URL patterns match frontend service calls
3. Check Django URL routing

---

## Success Criteria

### ✅ All Tests Pass When:
1. All modules load without errors
2. CRUD operations work for all modules
3. Search functionality works
4. Cascading dropdowns populate correctly
5. UI is responsive on all screen sizes
6. No console errors
7. Toast notifications display
8. Data persists after refresh

---

## 📊 Test Results Template

```
Date: _______________
Tester: _______________

Module          | Create | Read | Update | Delete | Search | UI
----------------|--------|------|--------|--------|--------|----
Dashboard       |   -    |  ☐   |   -    |   -    |   -    | ☐
Organizations   |   ☐    |  ☐   |   ☐    |   ☐    |   ☐    | ☐
Schools         |   ☐    |  ☐   |   ☐    |   ☐    |   ☐    | ☐
Admissions      |   ☐    |  ☐   |   ☐    |   ☐    |   ☐    | ☐
Students        |   ☐    |  ☐   |   ☐    |   ☐    |   ☐    | ☐
Teachers        |   ☐    |  ☐   |   ☐    |   ☐    |   ☐    | ☐
Classes         |   ☐    |  ☐   |   ☐    |   ☐    |   ☐    | ☐
Subjects        |   ☐    |  ☐   |   ☐    |   ☐    |   ☐    | ☐

Overall Status: ☐ PASS  ☐ FAIL

Notes:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## 🎉 Ready to Test!

Follow the steps above to thoroughly test your School Management System. Good luck! 🚀
