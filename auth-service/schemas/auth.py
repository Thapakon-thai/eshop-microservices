from sqlmodel import SQLModel
import uuid

# รับข้อมูล Login
class LoginRequest(SQLModel):
    email: str
    password: str

# ส่งข้อมูล Token กลับ (Response)
class TokenResponse(SQLModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class UserCreate(SQLModel):
    email: str
    password: str
    username: str | None = None
    full_name: str | None = None

class UserRead(SQLModel):
    id: uuid.UUID
    email: str
    username: str | None = None
    full_name: str | None = None
    is_active: bool


