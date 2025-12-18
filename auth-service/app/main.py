from fastapi import FastAPI
from app.api.v1.auth import router as auth_router
import uvicorn

from contextlib import asynccontextmanager
from app.db.session import engine
from sqlmodel import SQLModel
# Import models so they are registered in SQLModel.metadata
from app.models import user

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Tables to be created:", SQLModel.metadata.tables.keys())
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    yield

app = FastAPI(lifespan=lifespan)

app.include_router(auth_router, prefix="/api/v1", tags=["auth"])


@app.get("/")
async def root():
    return {"message": "Auth Service is running"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)