from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.factory import Factory
from app.schemas.factory import FactoryCreate, FactoryResponse

router = APIRouter(prefix="/factories", tags=["Factories"])


@router.post("", response_model=FactoryResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=FactoryResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def create_factory(factory_in: FactoryCreate, db: Session = Depends(get_db)):
    """
    Create a new factory record in the MySQL factories table.
    """
    new_factory = Factory(
        name=factory_in.name,
        location=factory_in.location.strip() if factory_in.location else None,
        industry_type=factory_in.industry_type.strip() if factory_in.industry_type else None
    )
    db.add(new_factory)
    db.commit()
    db.refresh(new_factory)
    return new_factory


@router.get("", response_model=List[FactoryResponse])
@router.get("/", response_model=List[FactoryResponse], include_in_schema=False)
def get_factories(db: Session = Depends(get_db)):
    """
    Retrieve all factory records from the MySQL database.
    """
    factories = db.query(Factory).all()
    return factories


@router.get("/{factory_id}", response_model=FactoryResponse)
def get_factory(factory_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a single factory by its primary ID.
    Returns 404 if the factory does not exist.
    """
    factory = db.query(Factory).filter(Factory.id == factory_id).first()
    if not factory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Factory not found"
        )
    return factory
