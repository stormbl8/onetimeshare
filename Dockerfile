# ---- Stage 1: Build Frontend ----
# Use a Node.js image to build the static frontend assets
FROM node:20-alpine AS build-frontend

WORKDIR /app/frontend

# Copy package files and install dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy the rest of the frontend code
COPY frontend/ ./ 

# Fix potential line ending and permission issues
RUN find ./node_modules/.bin/ -type f -exec sed -i 's/\r$//' {} + 
RUN find ./node_modules/.bin/ -type f -exec chmod +x {} + 

# Build the frontend for production. The output will be in /app/frontend/dist
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
