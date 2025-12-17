from pydantic import computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

class Settings(BaseSettings):
    PRIVATE_KEY_PATH: Path = Path("keys/private.pem")
    PUBLIC_KEY_PATH: Path = Path("keys/public.pem")

    DB_USER: str
    DB_PASSWORD: str
    DB_HOST: str
    DB_PORT: int = 5432
    AUTH_DB_NAME: str 

    ALGORITHM: str = "RS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @computed_field
    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.AUTH_DB_NAME}"

settings = Settings()

PRIVATE_KEY = settings.PRIVATE_KEY_PATH.read_text()
PUBLIC_KEY = settings.PUBLIC_KEY_PATH.read_text()