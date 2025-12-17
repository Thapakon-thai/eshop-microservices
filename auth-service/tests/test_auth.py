
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_register_login_flow(client: AsyncClient):
    # 1. Register a user
    user_data = {
        "email": "test@example.com",
        "password": "strongpassword",
        "username": "testuser",
        "full_name": "Test User"
    }
    response = await client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == user_data["email"]
    assert "id" in data
    
    # 2. Login with the user
    login_data = {
        "email": "test@example.com",
        "password": "strongpassword"
    }
    response = await client.post("/api/v1/auth/login", json=login_data)
    # This is expected to fail with 500 if the bug exists
    assert response.status_code == 200
    token_data = response.json()
    assert "access_token" in token_data
    assert "refresh_token" in token_data
