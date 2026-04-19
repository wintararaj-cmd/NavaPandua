# Database Setup Guide

## Current Status
✅ PostgreSQL user `school_user` created  
✅ PostgreSQL database `school_mgmt_db` created  
✅ Backend `.env` file configured  
✅ `psycopg2-binary` installed (v2.9.11)  
⚠️ Database migration history needs to be reset

## Issue
The PostgreSQL database has an inconsistent migration history because Django's built-in migrations (admin, auth) were applied before the custom user model migrations (accounts). This causes the error:

```
InconsistentMigrationHistory: Migration admin.0001_initial is applied before 
its dependency accounts.0001_initial on database 'default'.
```

## Solution: Reset PostgreSQL Database

### Option 1: Using SQL Shell (psql)

1. Open **SQL Shell (psql)** from Windows Start Menu
2. Connect with these credentials:
   - Server: `localhost` (press Enter)
   - Database: `postgres` (press Enter)
   - Port: `5432` (press Enter)
   - Username: `school_user`
   - Password: [your password]

3. Run these commands:
```sql
DROP DATABASE IF EXISTS school_mgmt_db;
CREATE DATABASE school_mgmt_db;
\q
```

### Option 2: Using pgAdmin

1. Open **pgAdmin**
2. Navigate to Servers → PostgreSQL → Databases
3. Right-click on `school_mgmt_db` → **Delete/Drop**
4. Right-click on **Databases** → **Create** → **Database**
5. Set:
   - Database name: `school_mgmt_db`
   - Owner: `school_user`
6. Click **Save**

### Option 3: Using PowerShell (if psql is in PATH)

```powershell
# Find your PostgreSQL bin directory (usually something like):
# C:\Program Files\PostgreSQL\16\bin

# Add to PATH temporarily or use full path:
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U school_user -d postgres -c "DROP DATABASE IF EXISTS school_mgmt_db; CREATE DATABASE school_mgmt_db;"
```

## After Database Reset

Once the database is reset, run these commands in the backend directory:

```powershell
# Activate virtual environment
.\venv\Scripts\activate

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

## Expected Migration Output

After resetting the database, you should see output like:

```
Operations to perform:
  Apply all migrations: accounts, admin, auth, contenttypes, organizations, 
  schools, sessions, students
Running migrations:
  Applying accounts.0001_initial... OK
  Applying accounts.0002_initial... OK
  Applying admin.0001_initial... OK
  Applying admin.0002_logentry_remove_auto_add... OK
  ...
  Applying organizations.0001_initial... OK
  Applying schools.0001_initial... OK
  Applying students.0001_initial... OK
```

## Database Configuration

Your `.env` file should have:

```env
DATABASE_URL=postgresql://school_user:your_password@localhost:5432/school_mgmt_db
```

## Troubleshooting

### Error: "password authentication failed"
- Verify the password in your `.env` file matches the PostgreSQL user password
- Check that `school_user` has the correct permissions

### Error: "database does not exist"
- Make sure you created the database `school_mgmt_db`
- Verify the database name in `.env` matches exactly

### Error: "psycopg2 not installed"
- Run: `pip install psycopg2-binary`

## Next Steps

After successful migration:

1. ✅ Create a superuser account
2. ✅ Start the development server
3. ✅ Access the admin panel at `http://localhost:8000/admin`
4. ✅ Test API endpoints at `http://localhost:8000/api/docs`
5. ✅ Set up the frontend application

## Useful Commands

```powershell
# Check migration status
python manage.py showmigrations

# Check for issues
python manage.py check

# Create new migrations (if models change)
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver

# Access Django shell
python manage.py shell
```

## Database Connection Test

To test if Django can connect to PostgreSQL:

```powershell
python manage.py dbshell
```

This should open a PostgreSQL prompt. Type `\q` to exit.
