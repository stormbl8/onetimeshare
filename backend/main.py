from fastapi import FastAPI, HTTPException, Request
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import timedelta
from fastapi.middleware.cors import CORSMiddleware
import redis
import redis.exceptions
import os

app = FastAPI()

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
    stored_value = r.get(token)
    if not stored_value:
        raise HTTPException(status_code=404, detail="Message not found or already read")

    r.delete(token)  # delete after reading
    return {"encrypted_message": stored_value}
