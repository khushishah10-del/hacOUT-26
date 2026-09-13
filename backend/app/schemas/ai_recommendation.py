"""
EcoLoop AI Recommendation Pydantic Schemas
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class AIRecommendationRequest(BaseModel):
    """
    Input schema for requesting AI-driven recommendations.
    Accepts deterministic emission calculation results and factory operational parameters.
    """
    factory_name: Optional[str] = Field(default=None, description="Factory or facility name")
    industry_type: Optional[str] = Field(default=None, description="Industry sector / manufacturing type")
    hotspot: Optional[str] = Field(default="No hotspot", description="Identified primary emission hotspot category")
    hotspot_percentage: Optional[float] = Field(default=0.0, description="Percentage share of total emissions from the hotspot")
    electricity_co2: Optional[float] = Field(default=0.0, description="Calculated Electricity CO2e in kg")
    fuel_co2: Optional[float] = Field(default=0.0, description="Calculated Fuel CO2e in kg")
    material_co2: Optional[float] = Field(default=0.0, description="Calculated Material CO2e in kg")
    waste_co2: Optional[float] = Field(default=0.0, description="Calculated Waste CO2e in kg")
    total_co2: Optional[float] = Field(default=0.0, description="Total Calculated CO2e in kg")
    material_type: Optional[str] = Field(default=None, description="Type of raw material utilized")
    material_quantity: Optional[float] = Field(default=0.0, description="Quantity of raw material")
    plastic_waste_kg: Optional[float] = Field(default=0.0, description="Plastic scrap/waste generated in kg")
    metal_waste_kg: Optional[float] = Field(default=0.0, description="Metal scrap/waste generated in kg")
    paper_waste_kg: Optional[float] = Field(default=0.0, description="Paper scrap/waste generated in kg")
    other_waste_kg: Optional[float] = Field(default=0.0, description="Other scrap/waste generated in kg")
    existing_recommendation: Optional[str] = Field(default=None, description="Deterministic rule-based recommendation fallback text")
    existing_circular_alternative: Optional[str] = Field(default=None, description="Deterministic circular alternative fallback text")


class RecommendationPayload(BaseModel):
    """
    Structured payload representing decarbonization and circular recommendations.
    """
    summary: str = Field(..., description="High-level executive summary of the facility's emission profile")
    hotspot_explanation: str = Field(..., description="Root-cause contextual explanation of the primary emission hotspot")
    recommended_actions: List[str] = Field(default_factory=list, description="Actionable decarbonization and efficiency initiatives")
    circular_alternative: str = Field(..., description="Circular economy strategy, resource recovery, or material substitution pathway")
    implementation_priority: str = Field(..., description="Action priority level: High, Medium, or Low")
    estimated_impact: str = Field(..., description="Indicative decarbonization and cost-reduction potential estimate")
    note: str = Field(
        default="AI-generated guidance is advisory. Calculated emissions are deterministic source of truth.",
        description="Standard advisory and compliance note"
    )


class AIRecommendationResponse(BaseModel):
    """
    Standard API response envelope for AI recommendation endpoint.
    """
    success: bool = Field(default=True, description="Indicates successful recommendation generation")
    source: str = Field(..., description="'openai' if generated via LLM, or 'rule_based_fallback' if generated deterministically")
    recommendation: RecommendationPayload = Field(..., description="Recommendation payload")
