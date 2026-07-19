from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/researchgenie"
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    GROQ_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    GOOGLE_API_KEY: str = ""
    LLM_PROVIDER: str = "groq"  # groq | openai | gemini

    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    FAISS_INDEX_DIR: str = "./faiss_indexes"
    UPLOAD_DIR: str = "./uploads"
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


def update_runtime_settings(**kwargs) -> Settings:
    """Mutate the cached Settings singleton in place.

    get_settings() is @lru_cache'd, so every module that did
    `settings = get_settings()` at import time is holding a reference to
    the SAME object. Setting attributes on it (instead of just changing
    os.environ, which nothing re-reads after startup) is what makes
    runtime changes from the Settings page actually take effect.
    """
    settings = get_settings()
    for key, value in kwargs.items():
        if value is not None and value != "" and hasattr(settings, key):
            setattr(settings, key, value)
    return settings
