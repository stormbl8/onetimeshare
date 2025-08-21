import os
from pydantic import BaseSettings


class Settings(BaseSettings):
REDIS_URL: str = os.getenv("REDIS_URL", "redis://redis:6379/0")
DEFAULT_TTL: int = int(os.getenv("DEFAULT_TTL", "3600"))


settings = Settings()