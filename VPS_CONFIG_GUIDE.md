# Coolify Deployment Guide — Navadaya School Management System
> **Fresh Install Reference** | VPS: `5.189.155.6` | Repo: `wintararaj-cmd/NavaPandua`

---

## Architecture Overview

```
navadaya.in          → Landing Page  (LandingPage — Nixpacks static)
admin.navadaya.in    → Admin Portal  (admin — Nixpacks Node preview)
api.navadaya.in      → Django API    (Main — Docker Compose)
                           ├── backend     (Gunicorn :8000)
                           ├── postgres    (PostgreSQL :5432)
                           ├── redis       (Redis :6379)
                           ├── celery      (worker)
                           └── celery-beat (scheduler)
```

---

## Phase 1 — Fresh VPS Setup

### 1.1 Connect & Update
```bash
ssh root@5.189.155.6
apt update && apt upgrade -y
apt install -y ufw
```

### 1.2 Firewall
```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp   # Coolify dashboard (can lock down after setup)
ufw enable
```

### 1.3 Swap File (Recommended for stability)
```bash
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
free -h   # verify
```

---

## Phase 2 — Install Coolify

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

- Wait ~2 minutes for installation to complete.
- Access dashboard at: **`http://5.189.155.6:3000`**
- Register your admin account on first visit.

---

## Phase 3 — Connect GitHub

1. In Coolify sidebar → **Sources** → **Add New Source** → **GitHub App**
2. Follow the OAuth flow to install the Coolify GitHub App on `wintararaj-cmd`
3. Grant access to the **`NavaPandua`** repository
4. Save. You should see `wintararaj-cmd` listed under Sources.

---

## Phase 4 — Create Project

1. Sidebar → **Projects** → **+ Add**
2. Name: `Navadaya`
3. Click into it → **+ Add Environment** → Name: `production`
4. Click into `production`

---

## Phase 5 — Service 1: Backend (Docker Compose)

This deploys Django API, PostgreSQL, Redis, and Celery via `docker-compose.yml`.

### 5.1 Add Resource
1. Click **+ New Resource**
2. Select **Private Repository (GitHub App)**
3. Repository: `wintararaj-cmd/NavaPandua`
4. Branch: `main`
5. Build Pack: **Docker Compose**
6. Docker Compose Location: `/docker-compose.yml`
7. Name: `Main`
8. Click **Save**

### 5.2 Configure Domains
In the **General** tab → **Domains** section:

| Field | Value |
|---|---|
| Domains for backend | `https://api.navadaya.in` |
| Domains for celery | *(leave empty)* |
| Domains for celery-beat | *(leave empty)* |

Click **Save**.

### 5.3 Environment Variables
Go to the **Environment Variables** tab. Add these exactly:

```env
DEBUG=False
SECRET_KEY=euw1YBOD-4xDP2ny2zvDqYsADg3VYbZMFMdnZg3wLLxNW1GNgFc_HK2iybKmLI6p3fo
ALLOWED_HOSTS=navadaya.in,api.navadaya.in,admin.navadaya.in,localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=https://navadaya.in,https://admin.navadaya.in
CSRF_TRUSTED_ORIGINS=https://navadaya.in,https://admin.navadaya.in

# DATABASE CONFIGURATION
# If using Coolify's internal Postgres:
DATABASE_URL=postgresql://school_user:school123@postgres:5432/school_mgmt_db
# OR If using an external/machine-formatted Postgres DB:
# DATABASE_URL=postgresql://user:password@host:port/dbname?sslmode=require

POSTGRES_DB=school_mgmt_db
POSTGRES_USER=school_user
POSTGRES_PASSWORD=school123
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

REDIS_URL=redis://redis:6379/0
CELERY_BROKER_URL=redis://redis:6379/1
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=1440
MAX_UPLOAD_SIZE=5242880
DEFAULT_PAGE_SIZE=20
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

> **IMPORTANT:** If you are using a **machine-formatted external database**, simply paste the full connection string into the `DATABASE_URL` field and ensure the `POSTGRES_...` variables match or are commented out if the application logic relies solely on `DATABASE_URL`.

Click **Save**.

### 5.4 Deploy
Click **Deploy**. Monitor the **Deployments** tab logs.

**Expected outcome:** Status → `Running (healthy)` (green dot) within ~3–5 minutes.

---

## Phase 6 — Service 2: Admin Portal

### 6.1 Add Resource
1. Click **+ New Resource**
2. Select **Private Repository (GitHub App)**
3. Repository: `wintararaj-cmd/NavaPandua`
4. Branch: `main`
5. Build Pack: **Nixpacks**
6. Name: `admin`
7. Click **Save**

### 6.2 General Configuration

| Field | Value |
|---|---|
| Name | `admin` |
| Build Pack | `Nixpacks` |
| Is it a static site? | ❌ No (unchecked) |
| Base Directory | `/frontend/admin-portal` |
| Install Command | `npm install` |
| Build Command | `npm run build` |
| Start Command | `npm run preview` |
| Publish Directory | `/` |

### 6.3 Domain
```
https://admin.navadaya.in
```

### 6.4 Environment Variables
```env
VITE_API_URL=https://api.navadaya.in/api/v1
NODE_ENV=production
```

### 6.5 Deploy
Click **Deploy**. Admin portal available at `https://admin.navadaya.in`.

---

## Phase 7 — Service 3: Landing Page

### 7.1 Add Resource
1. Click **+ New Resource**
2. Select **Private Repository (GitHub App)**
3. Repository: `wintararaj-cmd/NavaPandua`
4. Branch: `main`
5. Build Pack: **Nixpacks**
6. Name: `LandingPage`
7. Click **Save**

### 7.2 General Configuration

| Field | Value |
|---|---|
| Name | `LandingPage` |
| Build Pack | `Nixpacks` |
| Is it a static site? | ✅ Yes (checked) |
| Is it a SPA? | ❌ No |
| Static Image | `nginx:alpine` |
| Base Directory | `/frontend/landing-page` |
| Publish Directory | `dist` |

### 7.3 Domains
```
https://navadaya.in
https://nabodaya.in
```

### 7.4 Deploy
Click **Deploy**. Landing page live at `https://navadaya.in`.

---

## Phase 8 — Verify SSL Certificates

After all three services are deployed and **healthy**:

1. Go to **Servers** (left sidebar) → click your server → **Proxy** tab
2. Click **Restart Proxy**
3. Wait 1–2 minutes

Test from PowerShell on your local machine:
```powershell
curl.exe -kv https://api.navadaya.in 2>&1 | Select-String "issuer|subject|HTTP"
curl.exe -kv https://admin.navadaya.in 2>&1 | Select-String "issuer|subject|HTTP"
curl.exe -kv https://navadaya.in 2>&1 | Select-String "issuer|subject|HTTP"
```

Each should show `issuer: Let's Encrypt` — NOT `TRAEFIK DEFAULT CERT`.

---

## Phase 9 — Post-Deploy Tasks

In Coolify → **Main** service → **Terminal** tab → select `backend` container:

```bash
# Run migrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Collect static files (if needed)
python manage.py collectstatic --noinput

# Optional: Load sample data
python populate_data.py
```

---

## Phase 10 — Final Verification Checklist

| URL | Expected Result |
|---|---|
| `https://navadaya.in` | ✅ Landing page loads, no SSL warning |
| `https://admin.navadaya.in` | ✅ Login page loads |
| `https://api.navadaya.in/api/v1/` | ✅ JSON response or 401 |
| `https://api.navadaya.in/admin/` | ✅ Django admin login page |

---

## Troubleshooting

### ❌ Backend shows `Running (unhealthy)`
**Cause:** `python:3.11-slim` image does NOT have `curl`. Health check uses `curl` = always fails.  
**Fix:** Confirm `docker-compose.yml` healthcheck uses Python:
```yaml
healthcheck:
  test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/v1/')"]
  interval: 30s
  timeout: 10s
  retries: 5
  start_period: 40s
```

### ❌ `ERR_CERT_AUTHORITY_INVALID` (SSL error)
**Cause:** Traefik fell back to self-signed cert because the backend was unhealthy during deploy.  
**Fix:**
1. Fix unhealthy backend (above)
2. **Servers** → your server → **Proxy** → **Restart Proxy**
3. Wait 2 min → hard-refresh browser (`Ctrl+Shift+R`)

### ❌ `503 Service Unavailable` on `api.navadaya.in`
**Cause:** Backend unhealthy — Traefik won't route to it.  
**Fix:** Check **Logs** for `backend` container → fix error → Redeploy.

### ❌ PostgreSQL authentication error
**Cause:** Volume has stale data from old credentials.  
**Fix:** Main → **Danger Zone** → delete `postgres_data_v3` volume → Redeploy.  
> ⚠️ This wipes database data. Run migrations again after.

### ❌ CORS errors in browser console
**Fix:** Ensure no trailing slashes in env var:
```
CORS_ALLOWED_ORIGINS=https://navadaya.in,https://admin.navadaya.in
```

### ❌ Admin portal blank page / network errors
**Fix:** Set `VITE_API_URL=https://api.navadaya.in/api/v1` in admin service env vars → Redeploy.

## Phase 11 — Ongoing Maintenance & UI Updates

### 11.1 Updating the UI (Landing Page / Admin Portal)
If you make changes to the UI (e.g., updating the Hero section frame or Success Story styles):
1.  **Commit & Push**: Push your changes to the `main` branch on GitHub.
2.  **Auto-Deploy**: If you enabled "Auto-Deploy" in Coolify, it will start automatically.
3.  **Manual Deploy**: If not, go to the `LandingPage` or `admin` resource and click **Redeploy**.
4.  **Clear Cache**: After a UI update, perform a hard-refresh in your browser (`Ctrl + Shift + R`).

### 11.2 Database Migrations
When adding new features that change the database schema:
1.  Push your code with the new migration files (in `apps/*/migrations/`).
2.  Deploy the `Main` service.
3.  Go to **Main** → **Terminal** → select `backend`.
4.  Run `python manage.py migrate`.

---

## Quick Reference

### Domains
| Service | Coolify Name | Domain |
|---|---|---|
| Django API | `Main` | `https://api.navadaya.in` |
| Admin Portal | `admin` | `https://admin.navadaya.in` |
| Landing Page | `LandingPage` | `https://navadaya.in`, `https://nabodaya.in` |

### Coolify Navigation
| Task | Path |
|---|---|
| Restart SSL / Traefik | Servers → localhost → Proxy → Restart Proxy |
| Run commands in container | Projects → Navadaya → production → [Service] → Terminal |
| View logs | Projects → Navadaya → production → [Service] → Logs |
| Edit env vars | Projects → Navadaya → production → [Service] → Environment Variables |
| Delete a volume | Projects → Navadaya → production → [Service] → Danger Zone |
| Force redeploy | Projects → Navadaya → production → [Service] → Redeploy |
