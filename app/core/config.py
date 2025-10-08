from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
	database_url: str = "sqlite:///./orders.db"


@lru_cache
def get_settings() -> Settings:
	return Settings()


settings = get_settings()
