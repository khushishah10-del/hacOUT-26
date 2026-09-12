from sqlalchemy import Column, Date, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database.connection import Base


class FactoryData(Base):
    """
    SQLAlchemy ORM model for existing MySQL 'factory_data' table.
    """
    __tablename__ = "factory_data"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    factory_id = Column(Integer, ForeignKey("factories.id"), nullable=False, index=True)
    electricity_kwh = Column(Float, default=0.0, nullable=True)
    renewable_percentage = Column(Float, default=0.0, nullable=True)
    fuel_liters = Column(Float, default=0.0, nullable=True)
    material_type = Column(String(255), nullable=True)
    material_quantity = Column(Float, default=0.0, nullable=True)
    plastic_waste_kg = Column(Float, default=0.0, nullable=True)
    metal_waste_kg = Column(Float, default=0.0, nullable=True)
    paper_waste_kg = Column(Float, default=0.0, nullable=True)
    other_waste_kg = Column(Float, default=0.0, nullable=True)
    production_units = Column(Integer, default=0, nullable=True)
    date = Column(Date, nullable=False)

    factory = relationship("Factory", backref="data_records")
