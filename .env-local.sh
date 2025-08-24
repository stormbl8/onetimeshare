#!/bin/bash
# .env-local.sh
# Local environment version tracking

# Version numbers for services
export APP_VERSION="1.0.0"
export DOMAIN_NAME="localhost"

# Optional: other environment variables
export REDIS_HOST="redis"
export PYTHONUNBUFFERED=1
export VITE_API_BASE_URL=http://${DOMAIN_NAME}:8000