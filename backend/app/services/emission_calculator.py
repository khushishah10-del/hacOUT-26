"""
EcoLoop Emission Calculation Service

NOTE: These are DEMO / ESTIMATED emission factors matching the Phase 2 prototype.
They provide consistent benchmark estimates for local testing and prototyping.
In production, factors will be calibrated against official standard factors (e.g. GHG Protocol, CEA CO2 baseline).
"""
from typing import Dict, Any
from app.models.factory_data import FactoryData
from app.models.emission_result import EmissionResult
from app.schemas.emission_result import (
    CategoryPercentages,
    HotspotInfo,
    EmissionResultResponse,
)

# Demo emission factors matching frontend Phase 2 prototype
DEMO_EMISSION_FACTORS = {
    "electricity": 0.82,     # kg CO2e per kWh
    "fuel": 2.68,            # kg CO2e per liter
    "material": 0.50,        # kg CO2e per unit / kg
    "waste_plastic": 2.50,   # kg CO2e per kg
    "waste_metal": 1.80,     # kg CO2e per kg
    "waste_paper": 1.00,     # kg CO2e per kg
    "waste_other": 1.20,     # kg CO2e per kg
}


def calculate_emissions(factory_data: FactoryData) -> Dict[str, float]:
    """
    Computes category-wise and total greenhouse gas emissions from operational factory data.
    """
    electricity_kwh = max(0.0, float(factory_data.electricity_kwh or 0.0))
    fuel_liters = max(0.0, float(factory_data.fuel_liters or 0.0))
    material_quantity = max(0.0, float(factory_data.material_quantity or 0.0))
    plastic_waste_kg = max(0.0, float(factory_data.plastic_waste_kg or 0.0))
    metal_waste_kg = max(0.0, float(factory_data.metal_waste_kg or 0.0))
    paper_waste_kg = max(0.0, float(factory_data.paper_waste_kg or 0.0))
    other_waste_kg = max(0.0, float(factory_data.other_waste_kg or 0.0))

    electricity_co2 = round(electricity_kwh * DEMO_EMISSION_FACTORS["electricity"], 2)
    fuel_co2 = round(fuel_liters * DEMO_EMISSION_FACTORS["fuel"], 2)
    material_co2 = round(material_quantity * DEMO_EMISSION_FACTORS["material"], 2)

    waste_plastic_co2 = plastic_waste_kg * DEMO_EMISSION_FACTORS["waste_plastic"]
    waste_metal_co2 = metal_waste_kg * DEMO_EMISSION_FACTORS["waste_metal"]
    waste_paper_co2 = paper_waste_kg * DEMO_EMISSION_FACTORS["waste_paper"]
    waste_other_co2 = other_waste_kg * DEMO_EMISSION_FACTORS["waste_other"]

    waste_co2 = round(waste_plastic_co2 + waste_metal_co2 + waste_paper_co2 + waste_other_co2, 2)
    total_co2 = round(electricity_co2 + fuel_co2 + material_co2 + waste_co2, 2)

    return {
        "electricity_co2": electricity_co2,
        "fuel_co2": fuel_co2,
        "material_co2": material_co2,
        "waste_co2": waste_co2,
        "total_co2": total_co2,
    }


def calculate_percentages(
    electricity_co2: float,
    fuel_co2: float,
    material_co2: float,
    waste_co2: float,
    total_co2: float,
) -> CategoryPercentages:
    """
    Computes percentage share of emissions by category.
    Handles zero total emissions safely without division by zero.
    """
    if total_co2 <= 0.0:
        return CategoryPercentages(
            electricity=0.0,
            fuel=0.0,
            material=0.0,
            waste=0.0,
        )

    return CategoryPercentages(
        electricity=round((electricity_co2 / total_co2) * 100.0, 2),
        fuel=round((fuel_co2 / total_co2) * 100.0, 2),
        material=round((material_co2 / total_co2) * 100.0, 2),
        waste=round((waste_co2 / total_co2) * 100.0, 2),
    )


def detect_hotspot(
    electricity_co2: float,
    fuel_co2: float,
    material_co2: float,
    waste_co2: float,
    percentages: CategoryPercentages,
) -> HotspotInfo:
    """
    Dynamically determines the largest emission hotspot category.
    If total emissions are zero, returns 'No hotspot'.
    """
    candidates = [
        {"category": "Electricity", "value": electricity_co2, "percentage": percentages.electricity},
        {"category": "Fuel", "value": fuel_co2, "percentage": percentages.fuel},
        {"category": "Material", "value": material_co2, "percentage": percentages.material},
        {"category": "Waste", "value": waste_co2, "percentage": percentages.waste},
    ]

    max_candidate = max(candidates, key=lambda c: c["value"])
    if max_candidate["value"] <= 0.0:
        return HotspotInfo(
            category="No hotspot",
            value=0.0,
            percentage=0.0,
        )

    return HotspotInfo(
        category=max_candidate["category"],
        value=max_candidate["value"],
        percentage=max_candidate["percentage"],
    )


def build_analysis_response(record: EmissionResult) -> EmissionResultResponse:
    """
    Constructs an EmissionResultResponse from an EmissionResult ORM record,
    injecting calculated percentages and dynamic hotspot analysis.
    """
    percentages = calculate_percentages(
        electricity_co2=record.electricity_co2 or 0.0,
        fuel_co2=record.fuel_co2 or 0.0,
        material_co2=record.material_co2 or 0.0,
        waste_co2=record.waste_co2 or 0.0,
        total_co2=record.total_co2 or 0.0,
    )

    hotspot = detect_hotspot(
        electricity_co2=record.electricity_co2 or 0.0,
        fuel_co2=record.fuel_co2 or 0.0,
        material_co2=record.material_co2 or 0.0,
        waste_co2=record.waste_co2 or 0.0,
        percentages=percentages,
    )

    return EmissionResultResponse(
        id=record.id,
        factory_data_id=record.factory_data_id,
        electricity_co2=record.electricity_co2 or 0.0,
        fuel_co2=record.fuel_co2 or 0.0,
        material_co2=record.material_co2 or 0.0,
        waste_co2=record.waste_co2 or 0.0,
        total_co2=record.total_co2 or 0.0,
        created_at=record.created_at,
        percentages=percentages,
        hotspot=hotspot,
    )
