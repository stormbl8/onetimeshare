from fastapi import FastAPI, HTTPException, Request
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from pydantic import BaseModel
from typing import Optional
import bcrypt
import uuid
from datetime import datetime, timedelta
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Rate limiter setup
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Add CORS middleware
origins = ["*"]  # Allow all origins for LAN testing; you can restrict later

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store (replace with DB if needed)
messages = {}

# Request schema for creating messages
class CreateMessageRequest(BaseModel):
    message: str
    password: Optional[str] = None
    expire_minutes: Optional[int] = 60  # default TTL: 60 minutes

# Request schema for reading messages
class ReadMessageRequest(BaseModel):
    password: Optional[str] = None

@app.post("/api/create")
@limiter.limit("5/minute")  # Limit to 5 requests per minute per IP
def create_message(req: CreateMessageRequest, request: Request):
    token = str(uuid.uuid4())
    hashed_password = None
    if req.password:
        hashed_password = bcrypt.hashpw(req.password.encode(), bcrypt.gensalt()).decode()

    messages[token] = {
        "message": req.message,
        "password": hashed_password,
        "created_at": datetime.utcnow(),
        "expire_at": datetime.utcnow() + timedelta(minutes=req.expire_minutes)
    }

    return {"token": token, "expire_at": messages[token]["expire_at"]}

@app.post("/api/read/{token}")
@limiter.limit("10/minute")  # Limit to 10 requests per minute per IP
def read_message(token: str, req: ReadMessageRequest, request: Request):
    if token not in messages:
        raise HTTPException(status_code=404, detail="Message not found or already read")

    data = messages[token]

    # Check expiration
    if datetime.utcnow() > data["expire_at"]:
        del messages[token]
        raise HTTPException(status_code=410, detail="Message expired")

    # Check password
    if data["password"]:
        if not req.password:
            raise HTTPException(status_code=401, detail="Password required")
        if not bcrypt.checkpw(req.password.encode(), data["password"].encode()):
            raise HTTPException(status_code=401, detail="Incorrect password")

    message = data["message"]
    del messages[token]  # delete after reading
    return {"message": message}
