from datetime import datetime, timedelta, timezone
import jwt
from core.config import settings, PRIVATE_KEY
import secrets
from passlib.context import CryptContext


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, PRIVATE_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_refresh_token_str() -> str:
    return secrets.token_urlsafe(32)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

