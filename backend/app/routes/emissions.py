from typing import List
from fastapi import APIRouter, Depends, HTTPException, Path, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.factory_data import FactoryData
from app.models.emission_result import EmissionResult
from app.schemas.emission_result import EmissionResultResponse
from app.services.emission_calculator import (
    calculate_emissions,
    build_analysis_response,
)

router = APIRouter(tags=["Emission Analysis"])


@router.post(
    "/factory-data/{factory_data_id}/calculate-emissions",
    response_model=EmissionResultResponse,
    status_code=status.HTTP_200_OK,
)
def calculate_and_save_emissions(
    factory_data_id: int = Path(..., gt=0, description="Factory Data Submission ID"),
    db: Session = Depends(get_db)
):
    """
    Calculate greenhouse gas emissions from operational factory data,
    identify the primary emission hotspot, and store the result in MySQL.
    Returns 404 if the factory data submission does not exist.
    """
    factory_data = db.query(FactoryData).filter(FactoryData.id == factory_data_id).first()
    if not factory_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Factory data not found"
        )

    # Calculate emissions breakdown and total
    emissions = calculate_emissions(factory_data)

    # Persist calculation in emission_results table
    new_result = EmissionResult(
        factory_data_id=factory_data_id,
        electricity_co2=emissions["electricity_co2"],
        fuel_co2=emissions["fuel_co2"],
        material_co2=emissions["material_co2"],
        waste_co2=emissions["waste_co2"],
        total_co2=emissions["total_co2"],
    )
    db.add(new_result)
    db.commit()
    db.refresh(new_result)

    return build_analysis_response(new_result)


@router.get(
    "/emission-results/{result_id}",
    response_model=EmissionResultResponse,
    status_code=status.HTTP_200_OK,
)
def get_emission_result(
    result_id: int = Path(..., gt=0, description="Emission Result ID"),
    db: Session = Depends(get_db)
):
    """
    Retrieve a stored emission calculation by primary key ID,
    including percentage breakdown and hotspot analysis.
    Returns 404 if not found.
    """
    record = db.query(EmissionResult).filter(EmissionResult.id == result_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Emission result not found"
        )

    return build_analysis_response(record)


@router.get(
    "/factory-data/{factory_data_id}/emission-results",
    response_model=List[EmissionResultResponse],
    status_code=status.HTTP_200_OK,
)
def get_factory_data_emission_results(
    factory_data_id: int = Path(..., gt=0, description="Factory Data Submission ID"),
    db: Session = Depends(get_db)
):
    """
    Retrieve all emission calculation records for a specific factory data submission.
    Returns 404 if the factory data submission does not exist.
    """
    factory_data = db.query(FactoryData).filter(FactoryData.id == factory_data_id).first()
    if not factory_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Factory data not found"
        )

    records = db.query(EmissionResult).filter(EmissionResult.factory_data_id == factory_data_id).all()
    return [build_analysis_response(r) for r in records]
