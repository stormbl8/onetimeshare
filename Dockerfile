# ---- Stage 1: Build Frontend ----
FROM node:20-alpine AS build-frontend

WORKDIR /app/frontend

# Install dependencies
COPY frontend/package*.json ./
RUN npm ci --legacy-peer-deps

# Copy rest of frontend
COPY frontend/ ./

# 🔧 Fix CRLF and missing +x in node_modules/.bin
RUN find ./node_modules/.bin/ -type f -exec sed -i 's/\r$//' {} + \
 && find ./node_modules/.bin/ -type f -exec chmod +x {} +

# Run build
RUN apk add --no-cache libc6-compat
# Debugging commands
RUN ls -l ./node_modules/.bin/vite
RUN file ./node_modules/.bin/vite
RUN head -n 1 ./node_modules/.bin/vite

# Run build
RUN ./node_modules/.bin/vite build

# ---- Stage 2: Build Backend and Final Image ----
# Use a Python image for the final application
FROM python:3.11-slim

WORKDIR /app

# Install backend dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend application code
COPY backend/ ./

# Copy the built frontend assets from the build-frontend stage.
# The FastAPI server is configured to serve files from a 'static' directory.
COPY --from=build-frontend /app/frontend/dist /app/static

# Expose the port the application runs on
EXPOSE 8000

# Command to run the Uvicorn server in production
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
