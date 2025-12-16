from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

class Settings(BaseSettings):
    PRIVATE_KEY_PATH: Path = Path("certs/private_key.pem")
    PUBLIC_KEY_PATH: Path = Path("certs/public_key.pem")

    DATABASE_URL: str 
    ALGORITHM: str = "RS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()

PRIVATE_KEY = settings.PRIVATE_KEY_PATH.read_text()
PUBLIC_KEY = settings.PUBLIC_KEY_PATH.read_text()