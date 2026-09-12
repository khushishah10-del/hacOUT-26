import datetime
from typing import Optional
from pydantic import BaseModel, Field


class FactoryDataBase(BaseModel):
    electricity_kwh: float = Field(default=0.0, ge=0.0, description="Electricity consumption in kWh (>= 0)")
    renewable_percentage: float = Field(default=0.0, ge=0.0, le=100.0, description="Renewable energy percentage (0 to 100)")
    fuel_liters: float = Field(default=0.0, ge=0.0, description="Fuel consumption in liters (>= 0)")
    material_type: Optional[str] = Field(None, description="Type of raw material used")
    material_quantity: float = Field(default=0.0, ge=0.0, description="Material quantity consumed (>= 0)")
    plastic_waste_kg: float = Field(default=0.0, ge=0.0, description="Plastic waste in kg (>= 0)")
    metal_waste_kg: float = Field(default=0.0, ge=0.0, description="Metal waste in kg (>= 0)")
    paper_waste_kg: float = Field(default=0.0, ge=0.0, description="Paper waste in kg (>= 0)")
    other_waste_kg: float = Field(default=0.0, ge=0.0, description="Other waste in kg (>= 0)")
    production_units: int = Field(default=0, ge=0, description="Total units produced (>= 0)")
    date: datetime.date = Field(..., description="Reporting activity date (YYYY-MM-DD)")


class FactoryDataCreate(FactoryDataBase):
    """
    Schema for creating or submitting operational factory data.
    factory_id can be provided in the body or resolved from the URL path.
    """
    factory_id: Optional[int] = Field(None, gt=0, description="Factory ID reference")


class FactoryDataResponse(FactoryDataBase):
    """
    Schema for returning factory data records with database ID and foreign key.
    """
    id: int
    factory_id: int

    model_config = {"from_attributes": True}
