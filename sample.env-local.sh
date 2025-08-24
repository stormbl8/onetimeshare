#!/bin/bash
# .env-local.sh
# Local environment version tracking

# Version numbers for services
export APP_VERSION="1.1.1"

# Optional: other environment variables
export VITE_PUBLIC_HOST="http://otp.ozfe-digital.de:8080"
export REDIS_HOST="redis"
export PYTHONUNBUFFERED=1

# SMTP Configuration for Burn-on-Read Confirmation
# Replace with your SMTP server details
export SMTP_SERVER="your.smtp.server.com"
export SMTP_PORT="587"
export SMTP_USERNAME="your_email@example.com"
export SMTP_PASSWORD="your_email_password"