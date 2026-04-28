# Coolify Deployment Guide — Nabodaya School Management System

> **Reference Info** | VPS IP: `5.189.155.6` | GitHub Repo: `wintararaj-cmd/NavaPandua`

---

## 🏗 Architecture Overview

The system consists of three main frontend/backend services, routed securely via Coolify's built-in Traefik proxy.

```mermaid
graph TD
    User((User)) --> Proxy[Coolify Traefik Proxy]
    
    Proxy -->|navadaya.in / nabodaya.in| LP[Landing Page<br>Nixpacks Static]
    Proxy -->|admin.navadaya.in| Admin[Admin Portal<br>Nixpacks Node]
    Proxy -->|api.navadaya.in| API[Django API<br>Docker Compose]
    
    subgraph Backend Services
    API --> PG[(PostgreSQL)]
    API --> Redis[(Redis)]
    API --> Celery[Celery Worker]
    API --> CeleryBeat[Celery Beat]
    end
```

---

## 🚀 Phase 1: VPS Provisioning & Security

### 1.1 Connect & Update System
```bash
ssh root@5.189.155.6
apt update && apt upgrade -y
```

### 1.2 Configure UFW (Firewall)
Secure your server by only exposing necessary ports:
```bash
apt install -y ufw
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp   # Coolify Dashboard (Close this after initial setup if desired)
ufw enable
```

### 1.3 Add Swap File (Stability Optimization)
Prevent out-of-memory errors during build processes:
```bash
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
free -h   # Verify swap is active
```

---

## 🛠 Phase 2: Coolify Installation

Run the official installation script. This will take a few minutes.
```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

1. Navigate to your dashboard: **`http://5.189.155.6:3000`**
2. Register the initial admin account.

---

## 🔗 Phase 3: Connect GitHub Repository

1. In Coolify's left sidebar, go to **Sources** → **Add New Source** → **GitHub App**.
2. Complete the OAuth flow to install the Coolify GitHub App for your user/org (`wintararaj-cmd`).
3. Grant access specifically to the **`NavaPandua`** repository.
4. Save your configuration.

---

## 📂 Phase 4: Project Initialization

1. Sidebar → **Projects** → **+ Add**
2. Name the project: `Nabodaya`
3. Click into the project → **+ Add Environment** → Name it: `production`
4. Enter the `production` environment to begin adding resources.

---

## ⚙️ Phase 5: Deploy Services

### Service 1: Backend (Django API, Postgres, Redis, Celery)
*Deploys the entire backend stack using `docker-compose.yml`.*

1. **Add Resource**: Click **+ New Resource** → **Private Repository (GitHub App)**.
2. **Select Repo**: `wintararaj-cmd/NavaPandua`, Branch: `main`.
3. **Build Pack**: **Docker Compose**.
4. **Location**: `/docker-compose.yml`.
5. **Name**: `Main` → Click **Save**.
6. **Domains**: In the *General* tab, set Domains for backend to `https://api.navadaya.in`. Leave Celery/Celery-beat domains empty.
7. **Environment Variables**: Add the following:
    ```env
    DEBUG=False
    SECRET_KEY=euw1YBOD-4xDP2ny2zvDqYsADg3VYbZMFMdnZg3wLLxNW1GNgFc_HK2iybKmLI6p3fo
    ALLOWED_HOSTS=navadaya.in,nabodaya.in,api.navadaya.in,admin.navadaya.in,localhost,127.0.0.1
    CORS_ALLOWED_ORIGINS=https://navadaya.in,https://nabodaya.in,https://admin.navadaya.in
    CSRF_TRUSTED_ORIGINS=https://navadaya.in,https://nabodaya.in,https://admin.navadaya.in
    
    # Internal Database Connection
    DATABASE_URL=postgresql://school_user:school123@postgres:5432/school_mgmt_db
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
8. **Deploy**: Click **Deploy** and wait for the status to turn green (`Running (healthy)`).

---

### Service 2: Admin Portal (React/Vite)
*Deploys the administration dashboard.*

1. **Add Resource**: **Private Repository** → `wintararaj-cmd/NavaPandua` (branch `main`).
2. **Build Pack**: **Nixpacks** → Name: `AdminPortal` → Click **Save**.
3. **Configuration** (General Tab):
   - **Is it a static site?**: ❌ No
   - **Base Directory**: `/frontend/admin-portal`
   - **Install Command**: `npm install`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run preview`
   - **Publish Directory**: `/`
4. **Domain**: `https://admin.navadaya.in`
5. **Environment Variables**:
    ```env
    VITE_API_URL=https://api.navadaya.in/api/v1
    NODE_ENV=production
    ```
6. **Deploy**: Click **Deploy**.

---

### Service 3: Landing Page (Static)
*Deploys the public-facing website.*

1. **Add Resource**: **Private Repository** → `wintararaj-cmd/NavaPandua` (branch `main`).
2. **Build Pack**: **Nixpacks** → Name: `LandingPage` → Click **Save**.
3. **Configuration** (General Tab):
   - **Is it a static site?**: ✅ Yes
   - **Is it a SPA?**: ❌ No
   - **Static Image**: `nginx:alpine`
   - **Base Directory**: `/frontend/landing-page`
   - **Publish Directory**: `dist`
4. **Domains**: `https://navadaya.in, https://nabodaya.in`
5. **Deploy**: Click **Deploy**.

---

## 🔒 Phase 6: SSL & Proxy Verification

Ensure Let's Encrypt has properly provisioned certificates for all domains.

1. Sidebar → **Servers** → Your Server → **Proxy** tab.
2. Click **Restart Proxy** and wait 2 minutes.
3. **Test locally in PowerShell/Terminal**:
   ```powershell
   curl.exe -kv https://api.navadaya.in 2>&1 | Select-String "issuer|subject|HTTP"
   ```
   *Note: Output should show `issuer: Let's Encrypt`, avoiding the `TRAEFIK DEFAULT CERT`.*

---

## 🛠 Phase 7: Post-Deployment Setup

Initialize the database schema and admin user inside the backend container.

1. Go to your **Main** service → **Terminal** tab → Select the `backend` container.
2. Run the initialization commands:
    ```bash
    python manage.py migrate
    python manage.py createsuperuser
    python manage.py collectstatic --noinput
    ```

---

## 🚨 Troubleshooting Guide

| Issue | Root Cause | Solution |
|-------|-----------|----------|
| **Backend `Running (unhealthy)`** | Image lacks `curl` for healthcheck. | Ensure `docker-compose.yml` healthcheck uses: `test: ["CMD", "python", "-c", "import urllib.request..."]` |
| **`ERR_CERT_AUTHORITY_INVALID`** | Traefik fallback on unhealthy backend. | Fix backend health, then **Restart Proxy** in Server settings. Hard refresh browser. |
| **`503 Service Unavailable`** | Proxy cannot route to backend. | Check backend container logs. Usually a DB connection or syntax error. Redeploy once fixed. |
| **DB Auth Error (`password auth failed`)** | Stale credentials in Docker volume. | Go to Main → **Danger Zone** → Delete `postgres_data_v3` volume. Redeploy & run migrations. |
| **CORS Errors** | Trailing slash in env variables. | Remove trailing slashes in `CORS_ALLOWED_ORIGINS` & `CSRF_TRUSTED_ORIGINS`. |
| **Admin Portal Blank Page** | Incorrect API URL configuration. | Set `VITE_API_URL=https://api.navadaya.in/api/v1` and redeploy. |

---

## 🔄 Maintenance & CI/CD Workflow

*   **UI Updates**: Push to GitHub `main` branch. Coolify auto-deploys if webhooks/auto-deploy are enabled. Otherwise, manually click **Redeploy**.
*   **Database Changes**: After code with new migrations is deployed, always run `python manage.py migrate` in the `backend` terminal.
*   **Volume Management**: Database backups/resets can be managed under a service's **Danger Zone** tab or using standard `pg_dump` tools within the container.
