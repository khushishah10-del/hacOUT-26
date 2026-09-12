from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/health")
def get_health():
    """
    Health check endpoint verifying API service availability.
    """
    return {
        "status": "ok",
        "message": "EcoLoop API is running"
    }
