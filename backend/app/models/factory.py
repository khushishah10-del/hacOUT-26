from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.sql import func

from app.database.connection import Base


class Factory(Base):
    """
    SQLAlchemy ORM model for existing MySQL 'factories' table.
    """
    __tablename__ = "factories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    location = Column(String(255), nullable=True)
    industry_type = Column(String(255), nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
