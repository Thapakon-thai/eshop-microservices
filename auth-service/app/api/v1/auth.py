import asyncio
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.core import security
from app.schemas.auth import LoginRequest, UserCreate, UserRead
from app.db.session import get_session
from app.models.user import User, RefreshToken
from app.core.config import settings


router = APIRouter()

@router.post("/login")
async def login(data: LoginRequest, db: AsyncSession = Depends(get_session)):
    statement = select(User).where(User.email == data.email)
    result = await db.execute(statement)
    user = result.scalars().first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    is_password_valid = await asyncio.to_thread(
        security.verify_password, data.password, user.password_hash
    )

    if not is_password_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    access_token = security.create_access_token(
        data={"sub": str(user.id)}
    )

    refresh_token_str = security.create_refresh_token_str()
    refresh_token_expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    new_refresh_token = RefreshToken(
        token=refresh_token_str,
        expires_at=refresh_token_expires_at,
        user_id=user.id,
        created_at=datetime.now(timezone.utc),
        revoked=False
    )

    db.add(new_refresh_token)
    await db.commit()

    return {
        "access_token": access_token,
        "refresh_token": refresh_token_str,
        "token_type": "bearer"
    }

@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(user_create: UserCreate, db: AsyncSession = Depends(get_session)):
    statement = select(User).where(User.email == user_create.email)
    result = await db.execute(statement)
    existing_user = result.scalars().first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    if user_create.username:
        statement = select(User).where(User.username == user_create.username)
        result = await db.execute(statement)
        existing_username = result.scalars().first()
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken",
            )
        
    hash_password = await asyncio.to_thread(
        security.get_password_hash, user_create.password
    )

    new_user = User(
        email=user_create.email,
        password_hash=hash_password,
        username=user_create.username,
        full_name=user_create.full_name,
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return new_user


