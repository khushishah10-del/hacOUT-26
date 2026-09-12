from datetime import datetime
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.database.connection import Base


class EmissionResult(Base):
    """
    SQLAlchemy ORM model for existing MySQL 'emission_results' table.
    """
    __tablename__ = "emission_results"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    factory_data_id = Column(Integer, ForeignKey("factory_data.id"), nullable=False, index=True)
    electricity_co2 = Column(Float, default=0.0, nullable=True)
    fuel_co2 = Column(Float, default=0.0, nullable=True)
    material_co2 = Column(Float, default=0.0, nullable=True)
    waste_co2 = Column(Float, default=0.0, nullable=True)
    total_co2 = Column(Float, default=0.0, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=True)

    factory_data = relationship("FactoryData", backref="emission_results")
