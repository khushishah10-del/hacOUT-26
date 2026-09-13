"""
EcoLoop Circular Alternatives Service

NOTE:
1. Generates actionable circular-economy alternatives based on:
   - Primary emission hotspot (Electricity, Fuel, Material, Waste)
   - Specific raw material type and feedstock characteristics
   - Operational waste streams (plastic, metal, paper, other)
2. This service does NOT calculate greenhouse gas emissions; emission calculations
   remain isolated and strictly handled by app/services/emission_calculator.py.
3. Designed as a modular, extensible service for future AI enhancement.
"""

from typing import Any, Dict, Optional


class CircularAlternativesService:
    """
    Service providing circular-economy substitution pathways, resource recovery
    recommendations, and waste valorization strategies.
    """

    # Hotspot-driven circular strategies
    HOTSPOT_ALTERNATIVES = {
        "Electricity": {
            "primary_alternative": (
                "Increase renewable electricity usage through rooftop solar, "
                "renewable power procurement, or other suitable clean-energy sources."
            ),
            "secondary_alternative": (
                "Improve equipment efficiency and recover useful energy from "
                "suitable industrial processes."
            ),
            "resource_recovery": (
                "Reuse waste heat or recovered energy where technically feasible."
            ),
            "implementation_note": (
                "Prioritize high-consumption equipment and processes before "
                "making major infrastructure changes."
            ),
        },
        "Fuel": {
            "primary_alternative": (
                "Replace suitable fuel-powered processes with electric equipment "
                "powered by renewable electricity."
            ),
            "secondary_alternative": (
                "Improve fuel efficiency through preventive maintenance, "
                "process optimization, and heat recovery."
            ),
            "resource_recovery": (
                "Recover and reuse waste heat from industrial fuel-consuming "
                "processes where feasible."
            ),
            "implementation_note": (
                "Start with processes that can be electrified without affecting "
                "production quality or safety."
            ),
        },
        "Material": {
            "primary_alternative": (
                "Replace suitable virgin raw materials with recycled or recovered materials."
            ),
            "secondary_alternative": (
                "Optimize material usage to reduce production scrap and "
                "unnecessary material consumption."
            ),
            "resource_recovery": (
                "Recover usable material from production scrap and return it to "
                "the production cycle where possible."
            ),
            "implementation_note": (
                "Check material quality and technical requirements before substitution."
            ),
        },
        "Waste": {
            "primary_alternative": (
                "Segregate waste at source and increase recycling and material recovery."
            ),
            "secondary_alternative": (
                "Reuse suitable production waste internally or send it to "
                "appropriate recycling partners."
            ),
            "resource_recovery": (
                "Convert recyclable waste into secondary raw materials instead of disposal."
            ),
            "implementation_note": (
                "Start with the largest waste stream and track recovery rates over time."
            ),
        },
    }

    # Safe fallback circular alternative configuration
    FALLBACK = {
        "hotspot": "None",
        "primary_alternative": (
            "Improve plant-wide resource efficiency and optimize operational "
            "energy and material consumption."
        ),
        "secondary_alternative": (
            "Establish internal recycling and reuse loops for production scrap and packaging."
        ),
        "resource_recovery": (
            "Divert recyclable scrap and recover waste heat to support circular industrial symbiosis."
        ),
        "implementation_note": (
            "Conduct a preliminary material and energy flow audit to identify "
            "high-potential circular opportunities."
        ),
    }

    @classmethod
    def normalize_hotspot(cls, category: Optional[str]) -> Optional[str]:
        """
        Normalizes hotspot string to standard recognized categories.
        """
        if not category:
            return None

        clean = category.strip().lower()
        if "elect" in clean or "energy" in clean:
            return "Electricity"
        if "fuel" in clean:
            return "Fuel"
        if "material" in clean:
            return "Material"
        if "waste" in clean:
            return "Waste"
        return None

    @classmethod
    def get_material_specific_alternative(cls, material_type: Optional[str]) -> str:
        """
        Generates targeted circular recommendations based on the factory's primary raw material.
        Handles multi-material descriptions (e.g. Steel & Polypropylene).
        """
        if not material_type or not material_type.strip():
            return "Evaluate certified recycled or lower-carbon raw material substitutes suitable for the manufacturing process."

        mat_lower = material_type.lower()
        recommendations = []

        is_plastic = any(term in mat_lower for term in ["plastic", "polymer", "polypropylene", "resin", "pe", "pp", "pet", "pvc", "hdpe"])
        is_metal = any(term in mat_lower for term in ["metal", "steel", "iron", "aluminum", "alloy", "copper", "brass", "stamping"])
        is_paper = any(term in mat_lower for term in ["paper", "cardboard", "fiber", "packaging", "carton", "pulp"])

        if is_plastic:
            recommendations.append(
                "Incorporate certified recycled plastic, implement internal scrap reprocessing, "
                "and establish closed-loop polymer recovery."
            )
        if is_metal:
            recommendations.append(
                "Source certified secondary recycled metal, optimize scrap recovery from stamping/machining, "
                "and channel off-cuts into foundry remelting partnerships."
            )
        if is_paper:
            recommendations.append(
                "Transition to high-recycled-content paper and cardboard packaging, maximize paper fiber recovery, "
                "and deploy reusable collapsible dunnage containers."
            )

        if recommendations:
            return " ".join(recommendations)

        return (
            f"Evaluate certified recycled, bio-based, or lower-carbon alternatives for '{material_type.strip()}' "
            "to displace virgin feedstock extraction."
        )

    @classmethod
    def determine_largest_waste_stream(
        cls,
        plastic_waste_kg: float = 0.0,
        metal_waste_kg: float = 0.0,
        paper_waste_kg: float = 0.0,
        other_waste_kg: float = 0.0,
    ) -> str:
        """
        Identifies the dominant scrap category by mass.
        Returns 'None' if all waste quantities are zero.
        """
        streams = [
            ("Plastic", max(0.0, float(plastic_waste_kg or 0.0))),
            ("Metal", max(0.0, float(metal_waste_kg or 0.0))),
            ("Paper", max(0.0, float(paper_waste_kg or 0.0))),
            ("Other", max(0.0, float(other_waste_kg or 0.0))),
        ]

        # Check if all streams are zero
        max_stream = max(streams, key=lambda s: s[1])
        if max_stream[1] <= 0.0:
            return "None"

        return max_stream[0]

    @classmethod
    def get_circular_alternatives(
        cls,
        hotspot_category: Optional[str],
        material_type: Optional[str] = None,
        material_quantity: Optional[float] = 0.0,
        plastic_waste_kg: Optional[float] = 0.0,
        metal_waste_kg: Optional[float] = 0.0,
        paper_waste_kg: Optional[float] = 0.0,
        other_waste_kg: Optional[float] = 0.0,
        factory_data: Optional[Any] = None,
    ) -> Dict[str, Any]:
        """
        Main entry point generating structured circular alternatives.

        Parameters can be provided individually or extracted from a factory_data model/dict.
        """
        # If factory_data object or dict is passed, extract attributes if not explicitly provided
        if factory_data:
            if hasattr(factory_data, "material_type") and material_type is None:
                material_type = getattr(factory_data, "material_type", None)
            elif isinstance(factory_data, dict) and material_type is None:
                material_type = factory_data.get("material_type")

            if hasattr(factory_data, "plastic_waste_kg") and plastic_waste_kg in (0.0, None):
                plastic_waste_kg = getattr(factory_data, "plastic_waste_kg", 0.0)
            elif isinstance(factory_data, dict) and plastic_waste_kg in (0.0, None):
                plastic_waste_kg = factory_data.get("plastic_waste_kg", 0.0)

            if hasattr(factory_data, "metal_waste_kg") and metal_waste_kg in (0.0, None):
                metal_waste_kg = getattr(factory_data, "metal_waste_kg", 0.0)
            elif isinstance(factory_data, dict) and metal_waste_kg in (0.0, None):
                metal_waste_kg = factory_data.get("metal_waste_kg", 0.0)

            if hasattr(factory_data, "paper_waste_kg") and paper_waste_kg in (0.0, None):
                paper_waste_kg = getattr(factory_data, "paper_waste_kg", 0.0)
            elif isinstance(factory_data, dict) and paper_waste_kg in (0.0, None):
                paper_waste_kg = factory_data.get("paper_waste_kg", 0.0)

            if hasattr(factory_data, "other_waste_kg") and other_waste_kg in (0.0, None):
                other_waste_kg = getattr(factory_data, "other_waste_kg", 0.0)
            elif isinstance(factory_data, dict) and other_waste_kg in (0.0, None):
                other_waste_kg = factory_data.get("other_waste_kg", 0.0)

        # 1. Hotspot circular alternatives
        rule_key = cls.normalize_hotspot(hotspot_category)
        if rule_key and rule_key in cls.HOTSPOT_ALTERNATIVES:
            base_plan = cls.HOTSPOT_ALTERNATIVES[rule_key].copy()
            hotspot_name = rule_key
        else:
            base_plan = cls.FALLBACK.copy()
            hotspot_name = "None"

        # 2. Material-specific circular recommendations
        material_alternative = cls.get_material_specific_alternative(material_type)

        # 3. Dominant scrap / waste stream
        largest_waste = cls.determine_largest_waste_stream(
            plastic_waste_kg=plastic_waste_kg or 0.0,
            metal_waste_kg=metal_waste_kg or 0.0,
            paper_waste_kg=paper_waste_kg or 0.0,
            other_waste_kg=other_waste_kg or 0.0,
        )

        return {
            "hotspot": hotspot_name,
            "primary_alternative": base_plan["primary_alternative"],
            "secondary_alternative": base_plan["secondary_alternative"],
            "resource_recovery": base_plan["resource_recovery"],
            "implementation_note": base_plan["implementation_note"],
            "material_specific_alternative": material_alternative,
            "largest_waste_stream": largest_waste,
        }


# Convenient functional wrapper for external imports
def get_circular_alternatives(
    hotspot_category: Optional[str],
    material_type: Optional[str] = None,
    material_quantity: Optional[float] = 0.0,
    plastic_waste_kg: Optional[float] = 0.0,
    metal_waste_kg: Optional[float] = 0.0,
    paper_waste_kg: Optional[float] = 0.0,
    other_waste_kg: Optional[float] = 0.0,
    factory_data: Optional[Any] = None,
) -> Dict[str, Any]:
    """
    Convenience function calling CircularAlternativesService.get_circular_alternatives.
    """
    return CircularAlternativesService.get_circular_alternatives(
        hotspot_category=hotspot_category,
        material_type=material_type,
        material_quantity=material_quantity,
        plastic_waste_kg=plastic_waste_kg,
        metal_waste_kg=metal_waste_kg,
        paper_waste_kg=paper_waste_kg,
        other_waste_kg=other_waste_kg,
        factory_data=factory_data,
    )
