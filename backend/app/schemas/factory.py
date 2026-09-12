from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class FactoryBase(BaseModel):
    name: str = Field(..., min_length=1, description="Factory name is required")
    location: Optional[str] = Field(None, description="Factory geographical location")
    industry_type: Optional[str] = Field(None, description="Industry sector classification")

    @field_validator("name")
    @classmethod
    def validate_name_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Factory name cannot be empty or whitespace only")
        return v.strip()


class FactoryCreate(FactoryBase):
    """
    Schema for creating a new factory record.
    """
    pass


class FactoryResponse(FactoryBase):
    """
    Schema for returning factory details with database ID and timestamp.
    """
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}
