# OneTimeShare

OneTimeShare is a secure, open-source web app for sharing sensitive messages via one-time links. Messages are deleted after being read once, ensuring privacy and security.

## Features

- **One-time message sharing:** Messages self-destruct after a single view.
- **Optional password protection:** Add a password for extra security.
- **Expiration time:** Set how long the link remains valid.
- **Multi-language support:** English, Turkish, and German.
- **Dark/light theme toggle.**
- **QR code generation for easy sharing.**

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Vite, i18next, react-toastify
- **Backend:** FastAPI, Python, bcrypt
- **Containerization:** Docker, Docker Compose
- **Web server:** Nginx

## Getting Started

### Prerequisites

- Docker & Docker Compose installed

### Quick Start

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/onetimeshare.git
   cd onetimeshare
   ```

2. **Build and run with Docker Compose:**
   ```sh
   docker-compose up --build
   ```

3. **Access the app:**
   - Frontend: [http://localhost:8080](http://localhost:8080)
   - Backend API: [http://localhost:8000](http://localhost:8000)

### Development

#### Frontend

```sh
cd frontend
npm install
npm run dev
```

#### Backend

```sh
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Configuration

- **Frontend environment:** See [`frontend/.env`](frontend/.env)
- **Backend environment:** See [`backend/.env`](backend/.env)

## Folder Structure

See below for a summary:

```
onetimeshare/
  backend/
    main.py
    models.py
    app_settings.py
    requirements.txt
    Dockerfile
    .env
  frontend/
    src/
      components/
      contexts/
      hooks/
      locales/
      utils/
      App.tsx
      main.tsx
      i18n.ts
    nginx.conf
    .env
    ...
  docker-compose.yml
  README.md
  LICENSE
```

## License

MIT License. See [`LICENSE`](LICENSE) for details.

## Screenshots

![OneTimeShare Screenshot](frontend/public/screenshot.png)

## API Documentation

The backend provides interactive API documentation via Swagger UI:<br>
[http://localhost:8000/docs](http://localhost:8000/docs)

## Contributing

Contributions are welcome! Please see [`CONTRIBUTING.md`](CONTRIBUTING.md) for guidelines on submitting issues and pull requests.

## Security

If you discover a security vulnerability, please report it responsibly by emailing [Ozfe-Digital](mailto:info@ozfe-digital.de). We appreciate your help in keeping OneTimeShare safe.

## Contact

For questions, support, or feedback, open an issue or email [Ozfe-Digital](mailto:info@ozfe-digital.de).