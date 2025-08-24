# ---- Stage 1: Build Frontend ----
FROM node:20 AS build-frontend

WORKDIR /app/frontend

# Install dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy rest of frontend
COPY frontend/ ./

# Debugging: Check permissions before explicit chmod
RUN ls -l ./node_modules/.bin/vite

# Explicitly set permissions for vite
RUN chmod +x ./node_modules/.bin/vite

# Debugging: Check permissions after explicit chmod
RUN ls -l ./node_modules/.bin/vite

# Run build
RUN npm run build

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
