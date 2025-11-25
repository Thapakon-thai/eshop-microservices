from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import uvicorn
from jose import jwt
import datetime

app = FastAPI()

SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# Mock user database
fake_users_db = {
    "user1": {
        "username": "user1",
        "password": "password1"
    }
}

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@app.post("/login", response_model=Token)
async def login(user: UserLogin):
    if user.username not in fake_users_db or fake_users_db[user.username]["password"] != user.password:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/register")
async def register(user: UserLogin):
    if user.username in fake_users_db:
        raise HTTPException(status_code=400, detail="Username already registered")
    fake_users_db[user.username] = {"username": user.username, "password": user.password}
    return {"message": "User registered successfully"}

@app.get("/")
async def root():
    return {"message": "Auth Service is running"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
