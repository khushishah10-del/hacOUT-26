"""
EcoLoop Recommendation Engine Service (Deterministic Rule-Based Foundation)

NOTE:
1. These recommendations and circular alternatives are generated deterministically based on
   the factory's primary emission hotspot and proportional contribution.
2. Cost figures and CO2 reduction values are illustrative demo/hackathon estimates only.
   They are indicative heuristics and should NOT be treated as actual commercial quotations
   or guaranteed guaranteed savings.
3. This service does NOT calculate factory emissions; it strictly consumes existing
   calculated emission results from the emission calculator / database.
4. The service architecture is designed to be modular and cleanly extensible for future
   AI-enhanced recommendation providers (e.g., Gemini/LLM services).
"""

from typing import Any, Dict, Optional


class RecommendationEngine:
    """
    Deterministic rule-based recommendation engine for industrial decarbonization
    and circular economy transitions.
    """

    # Deterministic rule definitions by emission category
    RULES = {
        "Electricity": {
            "recommendation": (
                "Improve energy efficiency by optimizing high-consumption equipment, "
                "reducing idle power usage, and increasing renewable energy usage."
            ),
            "circular_alternative": (
                "Use renewable electricity and energy-efficient equipment to reduce "
                "dependence on conventional electricity."
            ),
            "co2_reduction_rate": 0.15,  # Indicative ~15% reduction demo estimate
            "cost_rate_factor": 0.12,    # Indicative unit cost factor demo estimate
        },
        "Fuel": {
            "recommendation": (
                "Reduce fuel-related emissions through fuel-efficient equipment, "
                "preventive maintenance, and gradual electrification of suitable industrial processes."
            ),
            "circular_alternative": (
                "Replace suitable fuel-powered processes with electric alternatives "
                "powered by renewable energy."
            ),
            "co2_reduction_rate": 0.20,  # Indicative ~20% reduction demo estimate
            "cost_rate_factor": 0.18,    # Indicative unit cost factor demo estimate
        },
        "Material": {
            "recommendation": (
                "Reduce material-related emissions by increasing recycled or lower-carbon "
                "material usage and optimizing material consumption."
            ),
            "circular_alternative": (
                "Replace virgin raw materials with recycled or recovered materials where "
                "technically feasible."
            ),
            "co2_reduction_rate": 0.12,  # Indicative ~12% reduction demo estimate
            "cost_rate_factor": 0.14,    # Indicative unit cost factor demo estimate
        },
        "Waste": {
            "recommendation": (
                "Improve waste segregation, recycling, reuse, and material recovery to "
                "reduce waste-related emissions."
            ),
            "circular_alternative": (
                "Convert recyclable waste into reusable secondary raw materials instead "
                "of sending it for disposal."
            ),
            "co2_reduction_rate": 0.18,  # Indicative ~18% reduction demo estimate
            "cost_rate_factor": 0.08,    # Indicative unit cost factor demo estimate
        },
    }

    # Safe fallback configuration for missing, zero, or unclassified hotspots
    FALLBACK = {
        "hotspot": "None",
        "recommendation": (
            "Maintain efficient plant operations and track resource utilization across "
            "energy, fuel, material, and waste streams."
        ),
        "circular_alternative": (
            "Adopt circular economy best practices by prioritizing waste reduction, "
            "energy efficiency, and resource reuse."
        ),
        "estimated_cost": 0.0,
        "estimated_co2_reduction": 0.0,
        "priority": "Low",
    }

    @classmethod
    def calculate_priority(cls, percentage: float) -> str:
        """
        Determines recommendation priority tier based on hotspot percentage contribution.
        - High: percentage >= 40%
        - Medium: percentage >= 20%
        - Low: otherwise
        """
        if percentage >= 40.0:
            return "High"
        elif percentage >= 20.0:
            return "Medium"
        return "Low"

    @classmethod
    def normalize_category(cls, category: Optional[str]) -> Optional[str]:
        """
        Normalizes category string to standard rule keys.
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
    def get_recommendation(
        cls,
        hotspot_category: Optional[str],
        hotspot_percentage: Optional[float] = 0.0,
        emission_value: Optional[float] = 0.0,
        factory_data: Optional[Any] = None,
    ) -> Dict[str, Any]:
        """
        Generates a rule-based recommendation object based on calculated emission hotspot metrics.

        Parameters:
        - hotspot_category: Identified hotspot category name (e.g., 'Electricity', 'Fuel', etc.)
        - hotspot_percentage: Hotspot contribution percentage (0 to 100)
        - emission_value: Calculated hotspot emissions in kg CO2e
        - factory_data: Optional contextual factory data object or dict

        Returns:
        Dictionary containing:
        - hotspot: str
        - recommendation: str
        - circular_alternative: str
        - estimated_cost: float
        - estimated_co2_reduction: float
        - priority: 'High' | 'Medium' | 'Low'
        """
        # Safe float conversion
        pct = max(0.0, float(hotspot_percentage or 0.0))
        val = max(0.0, float(emission_value or 0.0))

        # Safe fallback check: missing, zero, or "No hotspot"
        if not hotspot_category or hotspot_category in ("No hotspot", "None", "") or val <= 0.0 or pct <= 0.0:
            return cls.FALLBACK.copy()

        # Map to recognized rule key
        rule_key = cls.normalize_category(hotspot_category)
        if not rule_key or rule_key not in cls.RULES:
            return cls.FALLBACK.copy()

        rule = cls.RULES[rule_key]

        # Calculate priority
        priority = cls.calculate_priority(pct)

        # Calculate indicative demo estimates
        estimated_co2_reduction = round(val * rule["co2_reduction_rate"], 2)
        estimated_cost = round(val * rule["cost_rate_factor"], 2)

        return {
            "hotspot": rule_key,
            "recommendation": rule["recommendation"],
            "circular_alternative": rule["circular_alternative"],
            "estimated_cost": estimated_cost,
            "estimated_co2_reduction": estimated_co2_reduction,
            "priority": priority,
        }


# Convenient functional wrapper for external imports
def generate_recommendation(
    hotspot_category: Optional[str],
    hotspot_percentage: Optional[float] = 0.0,
    emission_value: Optional[float] = 0.0,
    factory_data: Optional[Any] = None,
) -> Dict[str, Any]:
    """
    Convenience function calling RecommendationEngine.get_recommendation.
    """
    return RecommendationEngine.get_recommendation(
        hotspot_category=hotspot_category,
        hotspot_percentage=hotspot_percentage,
        emission_value=emission_value,
        factory_data=factory_data,
    )
