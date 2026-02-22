import asyncio
import logging
from sqlmodel import select
from app.db.session import AsyncSessionLocal
from app.models.user import User
from app.core.security import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def seed_data():
    async with AsyncSessionLocal() as session:
        # Check if admin user exists
        statement = select(User).where(User.email == "admin@example.com")
        result = await session.execute(statement)
        user = result.scalar_one_or_none()
        
        if not user:
            logger.info("Creating admin user...")
            admin_user = User(
                email="admin@example.com",
                password_hash=get_password_hash("admin"),
                role="admin",
                is_active=True,
                is_verified=True,
                username="admin",
                full_name="System Admin"
            )
            session.add(admin_user)
            await session.commit()
            logger.info("Admin user created successfully")
        else:
            logger.info("Admin user already exists")

def main():
    asyncio.run(seed_data())

if __name__ == "__main__":
    main()
