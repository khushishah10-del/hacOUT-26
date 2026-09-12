import logging
from fastapi import APIRouter, HTTPException, status

from app.database.connection import check_database_connection

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Database"])


@router.get("/database/health")
def get_database_health():
    """
    Test whether FastAPI can successfully connect to MySQL database (ecoloop_db).
    Executes a real lightweight query (SELECT 1).
    """
    try:
        check_database_connection()
        return {
            "status": "ok",
            "message": "MySQL database connection successful"
        }
    except Exception as exc:
        logger.error("Database connection failure: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "status": "error",
                "message": "Unable to connect to MySQL database"
            }
        )
