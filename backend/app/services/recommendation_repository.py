"""
EcoLoop Recommendation Repository Service
Provides database persistence and retrieval operations for the 'recommendations' table.
"""
from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.recommendation import Recommendation
from app.schemas.recommendation import RecommendationCreate


def save_recommendation(db: Session, data: RecommendationCreate) -> Recommendation:
    """
    Persist a recommendation record into MySQL recommendations table.
    """
    new_recommendation = Recommendation(
        factory_id=data.factory_id,
        hotspot=data.hotspot,
        recommendation=data.recommendation,
        circular_alternative=data.circular_alternative,
        estimated_cost=data.estimated_cost,
        estimated_co2_reduction=data.estimated_co2_reduction,
        priority=data.priority,
    )
    db.add(new_recommendation)
    db.commit()
    db.refresh(new_recommendation)
    return new_recommendation


def get_recommendation_by_id(db: Session, recommendation_id: int) -> Optional[Recommendation]:
    """
    Retrieve a recommendation record by primary key id.
    """
    return db.query(Recommendation).filter(Recommendation.id == recommendation_id).first()


def get_recommendations_by_factory_id(db: Session, factory_id: int) -> List[Recommendation]:
    """
    Retrieve all recommendation records belonging to a specific factory,
    ordered by creation date descending.
    """
    return (
        db.query(Recommendation)
        .filter(Recommendation.factory_id == factory_id)
        .order_by(Recommendation.created_at.desc())
        .all()
    )
