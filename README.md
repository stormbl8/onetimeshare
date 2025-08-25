# OneTimeShare

OneTimeShare is a secure, open-source web app for sharing sensitive messages via one-time links. Messages are deleted after being read once, ensuring privacy and security.

## Features


- **End-to-end encrypted sharing**: Securely share secrets and files with one-time access links for maximum privacy.
- **One-time access links**: Ensure secrets are only accessible once, then deleted for security.
- **FastAPI backend**: Robust Python backend with health checks, encryption, and email notifications.
- **React + Tailwind CSS frontend**: Modern, responsive UI with multi-language support (English, German, Turkish).
- **Dockerized deployment**: Easy setup using Docker Compose; backend, frontend, Redis, and Nginx containers.
- **Automated CI/CD**: GitHub Actions pipeline builds, tags, and pushes images; creates releases with incremental notes.
- **Semantic versioning**: Version management via .env files, with automatic tagging and release note generation.
- **Redis integration**: Fast, ephemeral storage for secrets and access events.
- **Nginx reverse proxy**: Delivers frontend and handles routing securely.
- **Email notifications**: Sends alerts when secrets are accessed.
- **Health checks**: Implemented in Dockerfiles for backend and frontend services.
- **Multi-language support**: English, German, Turkish translations included.
- **Planned enhancements:**
    - Mobile-friendly UI for improved accessibility
    - Custom branding and preview links for shared secrets
    - OAuth login for secure authentication
    - Expanded API documentation for developers

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Vite
- **Backend:** FastAPI, Python, Redis
- **Containerization:** Docker, Docker Compose
- **CI/CD:** GitHub Actions

## Getting Started

### Local Development (Single Container Build)

This setup uses `docker-compose-dev.yml` to build and run a single Docker container that includes both the frontend (served by Nginx) and the backend (FastAPI).

#### Prerequisites

- Docker and Docker Compose v2 (included with Docker Desktop) must be installed.
- A Git client.

#### 1. Clone the Repository
```sh
git clone https://github.com/volkanoezdemir/onetimeshare.git
cd onetimeshare
```

#### 2. Create Local Environment File
Copy the sample local environment file. This file defines environment variables for local development.
```sh
cp sample.env-local.sh .env-local.sh
```
By default, this sets up the application to run on `localhost`. You can edit `.env-local.sh` if you need to change the domain or ports.

#### 3. Build and Run Development Environment
Run the development environment using the `docker-compose-dev.yml` file. This command sources your local environment variables, then builds and starts the single application container.
```sh
source .env-local.sh && docker-compose -f docker-compose-dev.yml up --build
```

#### 4. Access Development Services
- **Application Frontend:** [http://localhost:8080](http://localhost:8080)
- **Backend API (proxied by Nginx):** [http://localhost:8080/api](http://localhost:8080/api)
- **Backend API Docs (Swagger UI - proxied):** [http://localhost:8080/api/docs](http://localhost:8080/api/docs)

To stop the services:
```sh
docker-compose -f docker-compose-dev.yml down
```

### Running the Production Image Locally

To run the pre-built, production-ready Docker image (built and pushed by CI) locally:

#### 1. Ensure Docker is Running
Make sure Docker Desktop or your Docker daemon is active.

#### 2. Create Environment File (if needed)
If your application requires specific environment variables (e.g., `APP_VERSION`, `REDIS_HOST`), ensure they are set in your shell or in a `.env` file that `docker-compose` can pick up. For `APP_VERSION`, you can set it directly:
```sh
export APP_VERSION=latest # Or a specific version like v1.1.0
```

#### 3. Start the Services
Use the main `docker-compose.yml` file to pull and run the image.
```sh
docker-compose up -d # -d for detached mode
```

#### 4. Access the Application
- **Application Frontend:** [http://localhost:8080](http://localhost:8080)
- **Backend API (proxied by Nginx):** [http://localhost:8080/api](http://localhost:8080/api)
- **Backend API Docs (Swagger UI - proxied):** [http://localhost:8080/api/docs](http://localhost:8080/api/docs)

To stop the services:
```sh
docker-compose down
```

## Deployment (CI/CD)

This project uses a GitHub Actions workflow for continuous integration and deployment.

- **Trigger**: A push to the `master` branch will automatically trigger the CI/CD pipeline.
- **Process**: The pipeline, defined in `.github/workflows/ci.yml`, performs the following steps:
    1.  Builds a production-ready, single-container Docker image using the root `Dockerfile`.
    2.  Tags the image with the version number defined in the `.env` file.
    3.  Pushes the tagged image to the GitHub Container Registry (ghcr.io).
    4.  Updates the `CHANGELOG.md` file based on your `README.md`.

You **do not** need to build or push Docker images manually. Simply push your code changes to the `master` branch.

## Configuration

- **Local Development**: Configuration is managed in the `.env-local.sh` file. This is sourced into your shell before running `docker-compose`.
- **Deployment & Versioning**: The CI pipeline's versioning is controlled by the `APP_VERSION` variable in the root `.env` file. You must update this version number to release a new version of the Docker image.

## API Documentation

The backend provides interactive API documentation via Swagger UI. When running locally via the development setup, it is available at:<br>
[http://localhost:8080/api/docs](http://localhost:8080/api/docs)

## Contributing

Contributions are welcome! Please see `CONTRIBUTING.md` for guidelines on submitting issues and pull requests.

## Security

If you discover a security vulnerability, please report it responsibly by emailing [Ozfe-Digital](mailto:info@ozfe-digital.de). We appreciate your help in keeping OneTimeShare safe.

## Contact

For questions, support, or feedback, open an issue or email [Ozfe-Digital](mailto:info@ozfe-digital.de).

## License

MIT License. See [`LICENSE`](LICENSE) for details.