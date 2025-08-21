from pydantic import BaseModel
from typing import Optional

class CreateMessageRequest(BaseModel):
    message: str
    password: Optional[str] = None  # optional password
