from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, DateTime
from datetime import datetime, timezone
import uuid


class User(SQLModel, table=True):
    __tablename__ = "users"
    # Identifier field
    id: uuid.UUID | None = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    email: str = Field(index=True, nullable=False, unique=True)
    password_hash: str = Field(nullable=False)

    # Profile information
    username: str | None = Field(default=None, index=True, unique=True)
    full_name: str | None = None
    avatar_url: str | None = None

    # Access and status
    role: str = Field(default="user", nullable=False)
    is_active: bool = Field(default=True, nullable=False)
    is_verified: bool = Field(default=False, nullable=False)

    # Timestamps
    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False),
        default_factory=lambda: datetime.now(timezone.utc)
    )
    updated_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False),
        default_factory=lambda: datetime.now(timezone.utc)
    )

    refresh_tokens: list["RefreshToken"] = Relationship(back_populates="user")



class RefreshToken(SQLModel, table=True):
    id: uuid.UUID | None = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    token: str = Field(nullable=False, unique=True, index=True)
    expires_at: datetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))
    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False),
        default_factory=lambda: datetime.now(timezone.utc)
    )
    revoked: bool = Field(default=False, nullable=False)

    # Foreign key to User
    user_id: uuid.UUID = Field(foreign_key="users.id", nullable=False, index=True)
    user: "User" = Relationship(back_populates="refresh_tokens")

