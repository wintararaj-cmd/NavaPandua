FROM python:3.11-slim-bookworm

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    build-essential \
    libpq-dev \
    libjpeg-dev \
    zlib1g-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip and install common tools (cache-bust: 2026-05-07)
RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# Install Python dependencies in stages to improve caching
COPY requirements/ /app/requirements/

# Step 1: Install base dependencies
RUN pip install --no-cache-dir -r requirements/base.txt

# Step 2: Install production dependencies
RUN pip install --no-cache-dir -r requirements/production.txt

# Copy project
COPY . .

# Create necessary directories
RUN mkdir -p /app/static /app/media /app/logs

# Collect static files (with empty environment variables to avoid failures)
RUN SECRET_KEY=temp DATABASE_URL=sqlite:///:memory: python manage.py collectstatic --noinput || true

# Expose port
EXPOSE 8000

# Run gunicorn
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "120"]
