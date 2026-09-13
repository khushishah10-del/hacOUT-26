from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class RecommendationBase(BaseModel):
    """
    Base schema for recommendation data validation.
    """
    hotspot: str = Field(..., min_length=1, description="Primary emission hotspot category")
    recommendation: Optional[str] = Field(None, description="Decarbonization recommendation details")
    circular_alternative: Optional[str] = Field(None, description="Circular economy transition alternative")
    estimated_cost: Optional[float] = Field(default=0.0, ge=0, description="Indicative implementation cost")
    estimated_co2_reduction: Optional[float] = Field(default=0.0, ge=0, description="Indicative CO2e reduction in kg")
    priority: Optional[str] = Field(default="Medium", description="Action priority level: High, Medium, or Low")

    @field_validator("hotspot")
    @classmethod
    def validate_hotspot_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Hotspot cannot be empty or whitespace only")
        return v.strip()

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: Optional[str]) -> str:
        if not v or not v.strip():
            return "Medium"
        normalized = v.strip().capitalize()
        if normalized not in ("High", "Medium", "Low"):
            raise ValueError("Priority must be one of: High, Medium, Low")
        return normalized

    @field_validator("estimated_cost", "estimated_co2_reduction")
    @classmethod
    def validate_non_negative(cls, v: Optional[float]) -> float:
        if v is not None and v < 0:
            raise ValueError("Estimated values must be greater than or equal to 0")
        return float(v or 0.0)


class RecommendationCreate(RecommendationBase):
    """
    Schema for saving a new recommendation to MySQL.
    """
    factory_id: int = Field(..., gt=0, description="Valid Factory ID (must exist in database)")


class RecommendationResponse(RecommendationBase):
    """
    Schema for returning persisted recommendation records.
    """
    id: int
    factory_id: int
    created_at: datetime

    model_config = {"from_attributes": True}
