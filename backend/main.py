from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import timedelta
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import redis
import redis.exceptions
import os

app = FastAPI()

# CORS Middleware for development
# Allows the frontend dev server (e.g., on localhost:5173) to make requests to the backend.
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom key function for rate limiting that respects the X-Forwarded-For header
def get_real_ip(request: Request) -> str:
    # When behind a proxy like Nginx, the real IP is in this header.
    # The header can contain a comma-separated list if there are multiple proxies.
    # The client's IP is the first one in the list.
    if "x-forwarded-for" in request.headers:
        return request.headers["x-forwarded-for"].split(',')[0].strip()
    return get_remote_address(request)
# Rate limiter setup
limiter = Limiter(key_func=get_real_ip)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Connect to Redis
redis_host = os.getenv("REDIS_HOST", "localhost")
r = redis.Redis(host=redis_host, port=6379, db=0, decode_responses=True)

# Request schema for creating messages
class CreateMessageRequest(BaseModel):
    encrypted_message: str
    expire_minutes: Optional[int] = 60  # default TTL: 60 minutes

@app.get("/health")
def health_check():
    try:
        r.ping()
        return {"status": "ok"}
    except redis.exceptions.ConnectionError as e:
        raise HTTPException(status_code=503, detail=f"Redis connection error: {e}")

@app.post("/api/v1/create")
@limiter.limit("5/minute")  # Limit to 5 requests per minute per IP
def create_message(req: CreateMessageRequest, request: Request):
    token = str(uuid.uuid4())
    
    # Use Redis' built-in expiration feature (time in seconds)
    # The server now only stores the encrypted blob, it has no knowledge of the content.
    r.setex(token, timedelta(minutes=req.expire_minutes), req.encrypted_message)

    return {"token": token}

@app.post("/api/v1/read/{token}")
@limiter.limit("10/minute")  # Limit to 10 requests per minute per IP
def read_message(token: str, request: Request):
    # Atomically get and delete the key using GETDEL.
    # This prevents race conditions where a message could be read multiple times.
    stored_value = r.getdel(token)
    if not stored_value:
        raise HTTPException(status_code=404, detail="Message not found or already read")

    return {"encrypted_message": stored_value}

# --- Static Files Hosting (for production single-container setup) ---
# This section should only be active when the 'static' directory exists,
# which is true in the production Docker image but not in development.
static_dir = "static"
if os.path.isdir(static_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(static_dir, "assets")), name="assets")

    @app.exception_handler(404)
    async def custom_404_handler(request: Request, exc: HTTPException):
        """Catches 404 errors to serve the React app's index.html for client-side routing."""
        if not request.url.path.startswith(('/api/', '/health', '/docs', '/openapi.json')):
            return FileResponse(os.path.join(static_dir, 'index.html'), status_code=200)
        else:
            return JSONResponse(status_code=404, content={"detail": "Not Found"})
