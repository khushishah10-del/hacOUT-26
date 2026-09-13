from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.connection import Base


class Recommendation(Base):
    """
    SQLAlchemy ORM model for existing MySQL 'recommendations' table.
    Stores deterministic or AI-generated decarbonization recommendations
    and circular economy alternatives for a specific factory.
    """
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    factory_id = Column(
        Integer,
        ForeignKey("factories.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    hotspot = Column(String(255), nullable=True)
    recommendation = Column(Text, nullable=True)
    circular_alternative = Column(Text, nullable=True)
    estimated_cost = Column(Float, default=0.0, nullable=True)
    estimated_co2_reduction = Column(Float, default=0.0, nullable=True)
    priority = Column(String(50), nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    factory = relationship("Factory", backref="recommendations")
