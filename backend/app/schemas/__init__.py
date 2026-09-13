"""
EcoLoop Pydantic Validation Schemas Package
"""
from app.schemas.factory import FactoryCreate, FactoryResponse  # noqa: F401
from app.schemas.factory_data import FactoryDataCreate, FactoryDataResponse  # noqa: F401
from app.schemas.emission_result import (  # noqa: F401
    CategoryPercentages,
    HotspotInfo,
    EmissionResultBase,
    EmissionResultResponse,
)
from app.schemas.ai_recommendation import (  # noqa: F401
    AIRecommendationRequest,
    RecommendationPayload,
    AIRecommendationResponse,
)
from app.schemas.recommendation import (  # noqa: F401
    RecommendationCreate,
    RecommendationResponse,
)

