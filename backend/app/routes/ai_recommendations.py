"""
EcoLoop AI Recommendations API Route
Provides endpoint to generate actionable decarbonization and circular recommendations
powered by OpenAI with automatic rule-based fallback resilience.
"""
import logging
from fastapi import APIRouter, status

from app.schemas.ai_recommendation import (
    AIRecommendationRequest,
    AIRecommendationResponse,
)
from app.services.openai_service import generate_ai_recommendation

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/ai",
    tags=["AI Recommendations"],
)


@router.post(
    "/recommendation",
    response_model=AIRecommendationResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate Decarbonization & Circular Economy Recommendations",
    description=(
        "Accepts calculated greenhouse gas emission metrics and factory operational data. "
        "Interprets the primary hotspot and produces actionable decarbonization initiatives, "
        "circular alternatives, and implementation priorities using OpenAI (or rule-based fallback)."
    ),
)
def get_ai_recommendation(request_data: AIRecommendationRequest) -> AIRecommendationResponse:
    """
    Generate contextual decarbonization recommendations.
    Uses OpenAI if configured; otherwise gracefully returns deterministic rule-based guidance.
    """
    return generate_ai_recommendation(request_data)
