# ---- Stage 1: Build Frontend ----
FROM node:20 AS build-frontend

WORKDIR /app

# Install dependencies
COPY frontend/package*.json ./ 
RUN npm install

# Explicitly set permissions for all binaries in .bin and vite.js
RUN chmod +x ./node_modules/.bin/* || true
RUN chmod +x ./node_modules/vite/bin/vite.js || true

# Debugging: Check permissions of vite
RUN ls -l ./node_modules/.bin/vite
RUN ls -l ./node_modules/vite/bin/vite.js

# Copy rest of frontend
COPY frontend/ ./

# Run build
RUN npm run build

# ---- Stage 2: Build Backend ----
FROM python:3.11-slim AS build-backend

WORKDIR /app

# Install backend dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend application code
COPY backend/ ./

# ---- Stage 3: Final Image (Nginx + Backend) ----
FROM nginx:alpine

# Copy built frontend assets from build-frontend stage
COPY --from=build-frontend /app/dist /usr/share/nginx/html

# Copy backend application from build-backend stage
COPY --from=build-backend /app /app/backend

# Copy Nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy entrypoint script and make it executable
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Expose port 80 for Nginx
EXPOSE 80

# Set the entrypoint to our custom script
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]