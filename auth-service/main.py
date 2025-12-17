from fastapi import FastAPI
from api.v1.auth import router as auth_router
import uvicorn

app = FastAPI()

app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])


@app.get("/")
async def root():
    return {"message": "Auth Service is running"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)