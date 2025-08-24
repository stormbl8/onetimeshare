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
import email_sender # Import the email sender

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
    max_views: Optional[int] = 1 # default to 1 view
    sender_email: Optional[str] = None # Optional email for burn-on-read confirmation

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
    
    message_data = {
        "encrypted_message": req.encrypted_message,
        "max_views": str(req.max_views),
        "current_views": "0"
    }
    if req.sender_email:
        message_data["sender_email"] = req.sender_email
    
    r.hset(token, mapping=message_data)
    r.expire(token, timedelta(minutes=req.expire_minutes))

    return {"token": token}

@app.post("/api/v1/read/{token}")
@limiter.limit("10/minute")  # Limit to 10 requests per minute per IP
def read_message(token: str, request: Request):
    message_data = r.hgetall(token)
    if not message_data:
        raise HTTPException(status_code=404, detail="Message not found or already read")

    encrypted_message = message_data.get("encrypted_message")
    max_views = int(message_data.get("max_views", 1))
    current_views = int(message_data.get("current_views", 0))
    sender_email = message_data.get("sender_email") # Retrieve sender_email

    # Increment view count atomically
    new_current_views = r.hincrby(token, "current_views", 1)

    if new_current_views >= max_views:
        r.delete(token) # Delete the message if view limit is reached
        if sender_email: # Send confirmation email if sender_email is provided
            email_sender.send_burn_confirmation_email(sender_email, token)

    return {"encrypted_message": encrypted_message}

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
