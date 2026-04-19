# Quick Reference Guide

## 🚀 Start Development (Quick Commands)

### Backend:
```bash
cd backend
.\venv\Scripts\activate
python manage.py runserver
```

### Frontend:
```bash
cd frontend/admin-portal
npm run dev
```

### Both (in separate terminals):
```bash
# Terminal 1 - Backend
cd backend && .\venv\Scripts\activate && python manage.py runserver

# Terminal 2 - Frontend
cd frontend/admin-portal && npm run dev
```

## 📍 URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/api/docs
- **Admin Panel**: http://localhost:8000/admin

## 🔑 Default Credentials

Create superuser first:
```bash
python manage.py createsuperuser
```

## 📦 Install Dependencies

### Backend:
```bash
pip install -r requirements/development.txt
```

### Frontend:
```bash
npm install
```

## 🗄️ Database Commands

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Reset database (careful!)
python manage.py flush
```

## 🔧 Common Issues

### Port already in use:
```bash
# Kill process on port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Module not found:
```bash
# Reinstall dependencies
pip install -r requirements/development.txt
```

### Frontend build errors:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📝 File Structure

```
SchoolMgmtShankar/
├── backend/                 # Django backend
│   ├── apps/
│   │   ├── accounts/        # ✅ Authentication
│   │   ├── organizations/   # ✅ Organizations
│   │   ├── schools/         # ✅ Schools
│   │   └── ...              # 🔄 Other modules
│   ├── config/              # ✅ Django settings
│   └── manage.py
├── frontend/
│   └── admin-portal/        # ✅ React app
│       ├── src/
│       │   ├── pages/
│       │   ├── layouts/
│       │   ├── services/
│       │   └── stores/
│       └── package.json
└── docs/                    # 📚 Documentation
```

## 🎯 Next Steps

1. ✅ Setup backend and frontend
2. ✅ Test authentication
3. 🔄 Implement student module
4. 🔄 Implement teacher module
5. 🔄 Complete frontend pages

## 📚 Documentation

- **QUICKSTART.md** - Setup guide
- **DEVELOPMENT_SUMMARY.md** - What's been built
- **IMPLEMENTATION_PLAN.md** - Development roadmap
- **PROJECT_STATUS.md** - Current status

## 💡 Tips

- Always activate virtual environment
- Run migrations after model changes
- Check API docs for endpoint details
- Use React DevTools for debugging
- Check browser console for errors

---

**Happy Coding! 🚀**
