# VPS Configuration Guide for School Management System

This guide outlines the steps to configure a Linux VPS (Ubuntu 22.04/24.04 LTS recommended) for deploying your School Management System, including the Django backend, React frontend, PostgreSQL, Redis, and Celery.

## 1. System Requirements & Recommendations

Given your stack (Django + Postgres + Redis + Celery + React), we recommend:
- **CPU**: 2+ Cores
- **RAM**: 4GB Minimum (8GB recommended for production)
- **Storage**: 40GB+ SSD
- **OS**: Ubuntu 22.04 LTS or 24.04 LTS

---

## 2. Security Best Practices (Crucial)

Protect your server from brute-force attacks and unauthorized access.

### A. Use SSH Keys (Instead of Passwords)
Generate a key on your **local machine** (if you haven't):
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
ssh-copy-id shankar@your_server_ip
```

### B. Disable Password Authentication
Once you've verified you can login with your SSH key, disable passwords.
```bash
sudo nano /etc/ssh/sshd_config
```
Find and change these lines:
- `PasswordAuthentication no`
- `PermitRootLogin no` (Optional but recommended)

**Restart SSH:** `sudo systemctl restart ssh`

### C. Install & Configure Fail2Ban
Fail2Ban automatically bans IPs that show malicious behavior.

```bash
sudo apt install fail2ban -y

# Configure SSH protection
sudo bash -c 'cat > /etc/fail2ban/jail.local <<EOF
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
findtime = 600
bantime = 3600
EOF'

sudo systemctl restart fail2ban
```

---

## 3. Initial Server Hardening

Connect to your VPS: `ssh root@your_server_ip`

### Update System
```bash
apt update && apt upgrade -y
```

### Create a Non-Root User
```bash
adduser shankar
usermod -aG sudo shankar
# Switch to new user
su - shankar
```

### Setup Firewall (UFW)
```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 4. Swap File Configuration

Adding a swap file is highly recommended for stability, even with 8GB RAM.

```bash
# Create a 4GB swap file (adjust size as needed, e.g., 8G)
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make it persistent across reboots
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verify
free -h
```

---

## 3. Install Coolify

Coolify is an all-in-one PaaS that will manage your Docker containers, databases, and SSL automatically.

### One-line Installation
```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

### Accessing Coolify
Once the installation is complete, you can access the dashboard at:
`http://your_server_ip:3000`

---

## 4. Deploying with Coolify

Instead of manual Nginx configuration, you can use Coolify's UI:

1.  **Connect your Repository**: Link your GitHub/GitLab account.
2.  **Add a Project**: Create a new project for "School Management System".
3.  **Environment Variables**: Add your `.env` variables directly in the Coolify UI.
4.  **Docker Compose**: Coolify supports deploying directly from your `docker-compose.yml` file.

---

## 5. Coolify Deployment Guide (Step-by-Step)

Now that Coolify is installed and your code is on GitHub, follow these steps to deploy the entire stack.

### Step 1: Connect GitHub to Coolify
1.  Open your Coolify dashboard (`http://your_server_ip:3000`).
2.  Go to **Sources** -> **Add New Source** -> **GitHub App**.
3.  Follow the prompts to install the Coolify GitHub App on your `wintararaj-cmd` account and grant access to the `NavaPandua` repository.

### Step 2: Create a New Project
1.  Go to **Projects** -> **Add New Project**.
2.  Name it `School Management System`.
3.  Add a new **Environment** (e.g., `Production`).

### Step 3: Add the Resource (Docker Compose)
1.  Inside your environment, click **+ New Resource**.
2.  Select **Public Repository** or **Private Repository** (GitHub).
3.  Choose your repository: `wintararaj-cmd/NavaPandua`.
4.  Coolify will detect the `docker-compose.yml` file. Select **Docker Compose** as the build pack.

### Step 4: Configure Environment Variables
1.  In the resource settings, go to the **Environment Variables** tab.
2.  Copy the contents of your `.env` files into here. 
3.  **Required Variables:**
    - `DEBUG=False`
    - `SECRET_KEY=your-long-random-string`
    - `DATABASE_URL=postgres://postgres:password@school_postgres:5432/school_mgmt_db` (Coolify handles internal networking)

### Step 5: Configure Domains
1.  In the **General** tab of your resource, look for the **Domains** section.
2.  Add your domains:
    - Admin Portal: `admin.yourdomain.com`
    - Landing Page: `yourdomain.com`
    - API (if separate): `api.yourdomain.com`
3.  Coolify will automatically generate SSL certificates via Let's Encrypt.

### Step 6: Persistent Storage
Coolify will respect the `volumes` defined in your `docker-compose.yml`. 
- Ensure `postgres_data`, `static_volume`, and `media_volume` are mapped correctly so your data survives redeployments.

### Step 7: Deploy
1.  Click **Deploy**.
2.  Monitor the logs in the **Deployments** tab.
3.  Once finished, your site will be live at the domains you specified!

---

## 6. Troubleshooting Coolify

- **Logs:** If a service fails, check the "Logs" tab for that specific container inside Coolify.
- **Port Conflicts:** Ensure no other service (like manual Nginx) is using port 80 or 443 on the host. 
- **Database Migrations:** You can run migrations from the Coolify terminal for the `backend` container:
  ```bash
  python manage.py migrate
  ```
