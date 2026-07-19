from sqlalchemy import create_engine, inspect, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import get_settings

settings = get_settings()

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def run_lightweight_migrations():
    """Add any columns that exist on the SQLAlchemy models but not yet
    on the actual DB table.

    Base.metadata.create_all() (called at startup) only creates tables
    that don't exist yet — it silently does nothing for tables that
    already exist, even if the model has since grown new columns. Since
    this project has no Alembic migrations set up, anyone who already
    ran an earlier version of ResearchGenie against this database would
    otherwise get "column does not exist" errors the moment they touch
    profile fields, theme, or the AI provider preference. This adds
    those columns in place, non-destructively, if they're missing.
    """
    inspector = inspect(engine)
    if "users" not in inspector.get_table_names():
        return  # fresh DB — create_all() will create it with all columns

    existing_cols = {c["name"] for c in inspector.get_columns("users")}
    needed_cols = {
        "phone": "VARCHAR",
        "gender": "VARCHAR",
        "education": "VARCHAR",
        "location": "VARCHAR",
        "theme": "VARCHAR DEFAULT 'sage'",
        "llm_provider": "VARCHAR DEFAULT 'groq'",
    }
    missing = {k: v for k, v in needed_cols.items() if k not in existing_cols}
    if not missing:
        return

    with engine.connect() as conn:
        for col, coltype in missing.items():
            conn.execute(text(f'ALTER TABLE users ADD COLUMN {col} {coltype}'))
        conn.commit()
