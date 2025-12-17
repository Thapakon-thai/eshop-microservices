from fastapi import FastAPI
from api.v1.auth import router as auth_router

app = FastAPI()

app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])