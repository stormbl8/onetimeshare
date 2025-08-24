# Stage 1: Build the frontend
FROM node:20 AS frontend-builder
WORKDIR /app
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
COPY frontend/package*.json ./
RUN npm install
COPY frontend/. .
RUN npm run build

# Stage 2: Final image
FROM python:3.11-slim
WORKDIR /app

# Set PYTHONPATH for Python imports (still useful for other potential imports)
ENV PYTHONPATH=/app

# Install Nginx
RUN apt-get update && apt-get install -y nginx curl && rm -rf /var/lib/apt/lists/*

# Install backend dependencies directly in the final stage
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir bcrypt

# Copy frontend build artifacts
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# Copy backend application directly into /app
COPY backend/main.py backend/models.py backend/app_settings.py backend/email_sender.py ./

# Copy Nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Create a simple entrypoint script to start both Nginx and Uvicorn
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 80 8000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD curl -f http://localhost/ || exit 1

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
