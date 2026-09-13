"""
EcoLoop Business Logic & Services Package
"""
from app.services.emission_calculator import (  # noqa: F401
    calculate_emissions,
    calculate_percentages,
    detect_hotspot,
    build_analysis_response,
)
from app.services.recommendation_engine import (  # noqa: F401
    RecommendationEngine,
    generate_recommendation,
)
from app.services.circular_alternatives import (  # noqa: F401
    CircularAlternativesService,
    get_circular_alternatives,
)
from app.services.openai_service import (  # noqa: F401
    generate_ai_recommendation,
    build_rule_based_fallback,
)
from app.services.recommendation_repository import (  # noqa: F401
    save_recommendation,
    get_recommendation_by_id,
    get_recommendations_by_factory_id,
)

