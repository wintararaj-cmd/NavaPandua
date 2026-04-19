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

## 5. Nginx Reverse Proxy & SSL

Use Nginx on the host to handle HTTPS and proxy to Docker.

### Install Nginx & Certbot
```bash
sudo apt install nginx python3-certbot-nginx -y
```

### Configure Nginx
Create: `sudo nano /etc/nginx/sites-available/school_mgmt`

```nginx
server {
    server_name yourdomain.com;

    location / {
        # Proxy to Frontend (React)
        proxy_pass http://localhost:5173; 
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }

    location /api/ {
        # Proxy to Django Backend
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /static/ {
        alias /path/to/SchoolMgmtShankar/backend/staticfiles/;
    }

    location /media/ {
        alias /path/to/SchoolMgmtShankar/backend/media/;
    }
}
```

### Enable SSL
```bash
sudo ln -s /etc/nginx/sites-available/school_mgmt /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 6. Post-Deployment Commands

1. **Database Migrations**:
   ```bash
   docker exec -it school_backend python manage.py migrate
   ```
2. **Collect Static Files**:
   ```bash
   docker exec -it school_backend python manage.py collectstatic --noinput
   ```
3. **Admin User**:
   ```bash
   docker exec -it school_backend python manage.py createsuperuser
   ```

---

## 7. Monitoring
- Check logs: `docker compose logs -f`
- Monitor resources: `docker stats`
