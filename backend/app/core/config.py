"""Centralized application configuration via pydantic-settings."""

from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # App
    app_name: str = "We-can"
    environment: str = "development"
    api_v1_prefix: str = "/api/v1"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    # Database
    database_url: str = "sqlite+aiosqlite:///./wecan.db"

    # LLM provider
    llm_provider: str = "mock"
    llm_api_base: str = "https://api.openai.com/v1"
    llm_api_key: str = ""
    llm_model: str = "gpt-4o-mini"

    # Search provider
    search_provider: str = "mock"
    search_api_base: str = ""
    search_api_key: str = ""

    # Transcriber provider
    transcriber_provider: str = "mock"
    transcriber_api_base: str = ""
    transcriber_api_key: str = ""

    # Auth / security
    jwt_secret: str = "change-me-in-prod-please-set-a-long-random-secret"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    login_max_attempts: int = 5
    login_lockout_minutes: int = 10

    # Seed admin (auto-created on first startup)
    admin_email: str = "admin@wecan.dev"
    admin_username: str = "admin"
    admin_password: str = "Admin@12345"

    # Uploads
    upload_dir: str = "./uploads"
    max_upload_mb: int = 15

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def max_upload_bytes(self) -> int:
        return self.max_upload_mb * 1024 * 1024


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
