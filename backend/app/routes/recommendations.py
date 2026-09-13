"""
EcoLoop Recommendations API Routes
Provides endpoints to save and retrieve factory decarbonization recommendations.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Path, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.factory import Factory
from app.schemas.recommendation import (
    RecommendationCreate,
    RecommendationResponse,
)
from app.services.recommendation_repository import (
    get_recommendation_by_id,
    get_recommendations_by_factory_id,
    save_recommendation,
)

router = APIRouter(tags=["Recommendations"])


@router.post(
    "/recommendations",
    response_model=RecommendationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Save Decarbonization Recommendation",
    description="Persists a generated recommendation (deterministic or AI-driven) to MySQL.",
)
def create_recommendation(
    data: RecommendationCreate,
    db: Session = Depends(get_db),
) -> RecommendationResponse:
    """
    Save a recommendation associated with an existing factory.
    Returns 404 if the factory_id does not exist.
    """
    factory = db.query(Factory).filter(Factory.id == data.factory_id).first()
    if not factory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Factory with id {data.factory_id} not found",
        )

    saved = save_recommendation(db=db, data=data)
    return saved


@router.get(
    "/recommendations/{recommendation_id}",
    response_model=RecommendationResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Recommendation by ID",
    description="Fetches a persisted recommendation record by primary key id.",
)
def read_recommendation(
    recommendation_id: int = Path(..., gt=0, description="Recommendation record ID"),
    db: Session = Depends(get_db),
) -> RecommendationResponse:
    """
    Retrieve a specific recommendation by its ID.
    Returns 404 if the recommendation does not exist.
    """
    rec = get_recommendation_by_id(db=db, recommendation_id=recommendation_id)
    if not rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recommendation with id {recommendation_id} not found",
        )
    return rec


@router.get(
    "/factories/{factory_id}/recommendations",
    response_model=List[RecommendationResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Recommendations by Factory ID",
    description="Fetches all persisted recommendation records for a specific factory.",
)
def read_factory_recommendations(
    factory_id: int = Path(..., gt=0, description="Factory ID"),
    db: Session = Depends(get_db),
) -> List[RecommendationResponse]:
    """
    Retrieve all saved recommendations for a given factory.
    Returns 404 if the factory does not exist.
    """
    factory = db.query(Factory).filter(Factory.id == factory_id).first()
    if not factory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Factory with id {factory_id} not found",
        )
    return get_recommendations_by_factory_id(db=db, factory_id=factory_id)
