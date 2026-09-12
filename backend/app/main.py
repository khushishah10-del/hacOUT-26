from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import APP_NAME, APP_VERSION, CORS_ORIGINS
from app.routes.database_health import router as database_health_router
from app.routes.emissions import router as emissions_router
from app.routes.factories import router as factories_router
from app.routes.factory_data import router as factory_data_router
from app.routes.health import router as health_router

# Initialize FastAPI application
app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description="EcoLoop Industrial Emission Leak-Point Detector & Circular Recommender API"
)

# Configure CORS for frontend local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include route modules
app.include_router(health_router, prefix="/api")
app.include_router(database_health_router, prefix="/api")
app.include_router(factories_router, prefix="/api")
app.include_router(factory_data_router, prefix="/api")
app.include_router(emissions_router, prefix="/api")



@app.get("/")
def read_root():
    """
    Root API endpoint returning API welcome status and version.
    """
    return {
        "message": "Welcome to EcoLoop API",
        "version": APP_VERSION
    }
