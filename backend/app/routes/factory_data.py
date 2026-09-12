from typing import List
from fastapi import APIRouter, Depends, HTTPException, Path, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.factory import Factory
from app.models.factory_data import FactoryData
from app.schemas.factory_data import FactoryDataCreate, FactoryDataResponse

router = APIRouter(tags=["Factory Data"])


@router.post("/factories/{factory_id}/data", response_model=FactoryDataResponse, status_code=status.HTTP_201_CREATED)
def create_factory_data(
    factory_id: int = Path(..., gt=0, description="Factory ID"),
    data_in: FactoryDataCreate = ...,
    db: Session = Depends(get_db)
):
    """
    Save an operational factory data record for an existing factory.
    Returns 404 if the factory does not exist.
    """
    # 1. Check factory existence
    factory = db.query(Factory).filter(Factory.id == factory_id).first()
    if not factory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Factory not found"
        )

    # 2. Insert factory_data record
    new_record = FactoryData(
        factory_id=factory_id,
        electricity_kwh=data_in.electricity_kwh,
        renewable_percentage=data_in.renewable_percentage,
        fuel_liters=data_in.fuel_liters,
        material_type=data_in.material_type.strip() if data_in.material_type else None,
        material_quantity=data_in.material_quantity,
        plastic_waste_kg=data_in.plastic_waste_kg,
        metal_waste_kg=data_in.metal_waste_kg,
        paper_waste_kg=data_in.paper_waste_kg,
        other_waste_kg=data_in.other_waste_kg,
        production_units=data_in.production_units,
        date=data_in.date
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return new_record


@router.get("/factories/{factory_id}/data", response_model=List[FactoryDataResponse])
def get_factory_data_list(
    factory_id: int = Path(..., gt=0, description="Factory ID"),
    db: Session = Depends(get_db)
):
    """
    Retrieve all operational data records belonging to a specified factory.
    Returns 404 if the factory does not exist.
    """
    # 1. Check factory existence
    factory = db.query(Factory).filter(Factory.id == factory_id).first()
    if not factory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Factory not found"
        )

    records = db.query(FactoryData).filter(FactoryData.factory_id == factory_id).all()
    return records


@router.get("/factory-data/{data_id}", response_model=FactoryDataResponse)
def get_single_factory_data(
    data_id: int = Path(..., gt=0, description="Factory Data Record ID"),
    db: Session = Depends(get_db)
):
    """
    Retrieve a single factory data submission by its primary key.
    Returns 404 if not found.
    """
    record = db.query(FactoryData).filter(FactoryData.id == data_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Factory data not found"
        )
    return record
