from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL
from sqlalchemy.orm import declarative_base, sessionmaker

# Declarative base for ORM models
Base = declarative_base()

from app.config import DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER

# Construct database connection URL handling empty passwords cleanly
DATABASE_URL = URL.create(
    drivername="mysql+mysqlconnector",
    username=DB_USER,
    password=DB_PASSWORD if DB_PASSWORD else None,
    host=DB_HOST,
    port=DB_PORT,
    database=DB_NAME
)

# SQLAlchemy engine with connection pre-ping to verify stale connections
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600
)

# Session factory for future ORM session management
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


def get_db():
    """
    FastAPI dependency yielding database session and ensuring proper release.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_database_connection():
    """
    Performs a real lightweight query (SELECT 1) against ecoloop_db.
    Opens and cleanly releases the database connection.
    """
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return True
