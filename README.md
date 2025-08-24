# OneTimeShare

OneTimeShare is a secure, open-source web app for sharing sensitive messages via one-time links. Messages are deleted after being read once, ensuring privacy and security.

## Features

- **One-time message sharing:** Messages self-destruct after a single view.
- **End-to-end encryption:** Messages are encrypted in the browser and can only be decrypted by the recipient with the link. The server never sees the plaintext message.
- **Expiration time:** Set how long the link remains valid.
- **Multi-language support:** English, Turkish, and German.
- **Dark/light theme toggle.**
- **QR code generation for easy sharing.**

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Vite
- **Backend:** FastAPI, Python, Redis
- **Containerization:** Docker, Docker Compose
- **CI/CD:** GitHub Actions

## Getting Started (Local Development)

This setup uses Docker Compose to run the frontend and backend services with **hot-reloading**, which allows code changes to be reflected instantly without rebuilding images.

### Prerequisites

- Docker and Docker Compose v2 (included with Docker Desktop) must be installed.
- A Git client.

### 1. Clone the Repository
```sh
git clone https://github.com/volkanoezdemir/onetimeshare.git
cd onetimeshare
```

### 2. Create Local Environment File
Copy the sample local environment file. This file defines the environment variables for local development.
```sh
cp sample.env-local.sh .env-local.sh
```
By default, this sets up the application to run on `localhost`. You can edit `.env-local.sh` if you need to change the domain or ports.

### 3. Build and Run
Run the development environment using the `docker-compose-dev.yml` file. This command sources your local environment variables, then builds and starts the containers.
```sh
source .env-local.sh && docker-compose -f docker-compose-dev.yml up --build
```

### 4. Access the Services
- **Application Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API Docs (Swagger UI):** [http://localhost:8000/docs](http://localhost:8000/docs)

## Deployment (CI/CD)

This project uses a GitHub Actions workflow for continuous integration and deployment.

- **Trigger**: A push to the `master` branch will automatically trigger the CI/CD pipeline.
- **Process**: The pipeline, defined in `.github/workflows/ci.yml`, performs the following steps:
    1.  Builds a production-ready, multi-stage Docker image using the root `Dockerfile`.
    2.  Tags the image with the version number defined in the `.env` file.
    3.  Pushes the tagged image to the GitHub Container Registry (ghcr.io).
    4.  Updates the `CHANGELOG.md` file based on your `README.md`.

You **do not** need to build or push Docker images manually. Simply push your code changes to the `master` branch.

## Configuration

- **Local Development**: Configuration is managed in the `.env-local.sh` file. This is sourced into your shell before running `docker-compose`.
- **Deployment & Versioning**: The CI pipeline's versioning is controlled by the `APP_VERSION` variable in the root `.env` file. You must update this version number to release a new version of the Docker image.

## API Documentation

The backend provides interactive API documentation via Swagger UI. When running locally, it is available at:<br>
[http://localhost:8000/docs](http://localhost:8000/docs)

## Contributing

Contributions are welcome! Please see `CONTRIBUTING.md` for guidelines on submitting issues and pull requests.

## Security

If you discover a security vulnerability, please report it responsibly by emailing [Ozfe-Digital](mailto:info@ozfe-digital.de). We appreciate your help in keeping OneTimeShare safe.

## Contact

For questions, support, or feedback, open an issue or email [Ozfe-Digital](mailto:info@ozfe-digital.de).

## License

MIT License. See [`LICENSE`](LICENSE) for details.