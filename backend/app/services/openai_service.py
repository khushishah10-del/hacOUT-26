"""
EcoLoop OpenAI Recommendation Service
Provides AI-driven decarbonization guidance with deterministic rule-based fallback.

NOTE:
1. External AI does NOT calculate or recalculate CO2 emissions; deterministic emission
   calculator remains the single source of truth.
2. AI interprets the calculated results, explains the primary hotspot, and formulates
   actionable decarbonization & circular economy pathways.
3. If OpenAI API key is missing, invalid, rate-limited, timed out, or returns malformed
   data, this service seamlessly falls back to EcoLoop's deterministic rule engines.
"""
import json
import logging
from typing import Any, Dict, List, Optional

from app.config import OPENAI_API_KEY, OPENAI_MODEL
from app.schemas.ai_recommendation import (
    AIRecommendationRequest,
    AIRecommendationResponse,
    RecommendationPayload,
)
from app.services.circular_alternatives import CircularAlternativesService
from app.services.recommendation_engine import RecommendationEngine

logger = logging.getLogger(__name__)


def build_rule_based_fallback(data: AIRecommendationRequest) -> AIRecommendationResponse:
    """
    Generate structured recommendations deterministically using RecommendationEngine
    and CircularAlternativesService when OpenAI is unavailable or fails.
    """
    # 1. Hotspot category & value determination
    hotspot_name = data.hotspot or "No hotspot"
    hotspot_pct = max(0.0, float(data.hotspot_percentage or 0.0))
    total_co2 = max(0.0, float(data.total_co2 or 0.0))

    # Determine hotspot emission value in kg CO2e
    emission_map = {
        "Electricity": max(0.0, float(data.electricity_co2 or 0.0)),
        "Fuel": max(0.0, float(data.fuel_co2 or 0.0)),
        "Material": max(0.0, float(data.material_co2 or 0.0)),
        "Waste": max(0.0, float(data.waste_co2 or 0.0)),
    }
    hotspot_val = emission_map.get(hotspot_name, 0.0)
    if hotspot_val == 0.0 and total_co2 > 0 and hotspot_pct > 0:
        hotspot_val = round((total_co2 * hotspot_pct) / 100.0, 2)

    # 2. Invoke RecommendationEngine
    rec_result = RecommendationEngine.get_recommendation(
        hotspot_category=hotspot_name,
        hotspot_percentage=hotspot_pct,
        emission_value=hotspot_val,
        factory_data=data,
    )

    # 3. Invoke CircularAlternativesService
    circ_result = CircularAlternativesService.get_circular_alternatives(
        hotspot_category=hotspot_name,
        material_type=data.material_type,
        material_quantity=data.material_quantity,
        plastic_waste_kg=data.plastic_waste_kg,
        metal_waste_kg=data.metal_waste_kg,
        paper_waste_kg=data.paper_waste_kg,
        other_waste_kg=data.other_waste_kg,
        factory_data=data,
    )

    # 4. Construct high-level summary
    facility_name = data.factory_name or "Facility"
    industry_desc = f" ({data.industry_type})" if data.industry_type else ""
    if total_co2 > 0:
        summary = (
            f"Emission assessment for {facility_name}{industry_desc}: Total emissions are "
            f"{total_co2:.2f} kg CO2e, with {hotspot_name} identified as the primary hotspot "
            f"accounting for {hotspot_pct:.1f}% of emissions."
        )
    else:
        summary = (
            f"Emission assessment for {facility_name}{industry_desc}: Baseline data indicates "
            f"no significant greenhouse gas emissions recorded."
        )

    # 5. Hotspot explanation
    hotspot_explanations = {
        "Electricity": (
            "Electricity consumption is the dominant emission driver, resulting from grid power reliance, "
            "continuous motor loads, HVAC, or compressed air systems. Improving equipment efficiency "
            "and expanding renewable energy sourcing will deliver the fastest decarbonization gains."
        ),
        "Fuel": (
            "Direct fuel combustion (diesel, natural gas, fuel oil) is the primary emission driver, "
            "stemming from boilers, thermal furnaces, or industrial machinery. Transitioning to heat recovery "
            "and clean electrification represents the most strategic long-term pathway."
        ),
        "Material": (
            "Embedded emissions from raw material extraction and processing dominate the carbon footprint. "
            "Sourcing circular, recycled, or lower-carbon substitute feedstocks will substantially "
            "reduce Scope 3 cradle-to-gate intensity."
        ),
        "Waste": (
            "Operational scrap generation and landfill disposal represent the largest carbon leakage point. "
            "Aggressive point-of-origin segregation, internal scrap recycling, and secondary market "
            "revalorization will curtail environmental impact."
        ),
    }
    hotspot_explanation = hotspot_explanations.get(
        hotspot_name,
        "Emissions are balanced across operational categories without a single dominant category exceeding primary intervention thresholds."
    )

    # 6. Recommended Actions
    recommended_actions: List[str] = []
    if rec_result.get("recommendation"):
        recommended_actions.append(rec_result["recommendation"])

    # Add category-specific actionable steps
    if hotspot_name == "Electricity":
        recommended_actions.append(
            "Conduct an investment-grade energy audit on high-power motors, compressors, and chillers."
        )
        recommended_actions.append(
            "Install automated energy sub-metering to identify idle consumption during off-shift hours."
        )
    elif hotspot_name == "Fuel":
        recommended_actions.append(
            "Implement waste heat recovery on flue gas and exhaust ducts to preheat boiler feed water."
        )
        recommended_actions.append(
            "Evaluate converting low-to-medium temperature thermal processes to industrial electric heat pumps."
        )
    elif hotspot_name == "Material":
        recommended_actions.append(
            "Review scrap yield rates and implement precision cutting/stamping optimization to curtail scrap."
        )
        recommended_actions.append(
            "Engage tier-1 suppliers to verify environmental product declarations (EPDs) and evaluate recycled feedstocks."
        )
    elif hotspot_name == "Waste":
        recommended_actions.append(
            "Implement multi-stream segregation at workstations to prevent scrap contamination."
        )
        recommended_actions.append(
            "Partner with specialized recyclers to convert production scrap into secondary manufacturing grades."
        )
    else:
        recommended_actions.append(
            "Establish baseline sub-metering across production lines to continuously track operational intensity."
        )

    # 7. Circular Alternative synthesis
    circular_text = circ_result.get("primary_alternative", "")
    mat_alt = circ_result.get("material_specific_alternative")
    if mat_alt and "Explore secondary raw material options" not in mat_alt:
        circular_text = f"{circular_text} For raw materials: {mat_alt}"
    largest_waste = circ_result.get("largest_waste_stream")
    if isinstance(largest_waste, str) and largest_waste not in ("None", ""):
        circular_text = (
            f"{circular_text} Primary scrap recovery focus: {largest_waste} waste valorization and closed-loop recycling."
        )
    elif isinstance(largest_waste, dict) and largest_waste.get("stream") not in ("None", "", None):
        circular_text = (
            f"{circular_text} Primary scrap recovery focus: {largest_waste.get('stream')} "
            f"({largest_waste.get('quantity_kg', '')} kg) — {largest_waste.get('strategy', 'closed-loop recycling')}."
        )

    # 8. Estimated impact
    est_co2 = rec_result.get("estimated_co2_reduction", 0.0)
    est_cost = rec_result.get("estimated_cost", 0.0)
    priority = rec_result.get("priority", "Medium")

    estimated_impact = (
        f"Indicative potential CO2e reduction of ~{est_co2:.2f} kg CO2e with an estimated initiative "
        f"cost factor ~{est_cost:.2f} (illustrative demo estimate; subject to site audit)."
    )

    payload = RecommendationPayload(
        summary=summary,
        hotspot_explanation=hotspot_explanation,
        recommended_actions=recommended_actions,
        circular_alternative=circular_text.strip(),
        implementation_priority=priority,
        estimated_impact=estimated_impact,
        note="Advisory recommendation generated via EcoLoop deterministic rules engine (fallback mode). Source calculations are verified.",
    )

    return AIRecommendationResponse(
        success=True,
        source="rule_based_fallback",
        recommendation=payload,
    )


def _build_system_prompt() -> str:
    """
    Construct the system prompt establishing AI persona and constraints.
    """
    return (
        "You are EcoLoop AI, a senior industrial decarbonization engineer and circular economy specialist.\n"
        "Your objective is to analyze verified industrial greenhouse gas emission data and generate actionable, "
        "practical, and technically sound recommendations.\n\n"
        "CRITICAL RULES:\n"
        "1. DO NOT recalculate, alter, or contradict the calculated CO2 emission numbers provided. "
        "The deterministic carbon accounting figures provided are the single source of truth.\n"
        "2. Address the factory's primary emission hotspot specifically and explain why it is the root driver.\n"
        "3. Provide 3-4 concrete, numbered, engineering-grounded decarbonization actions.\n"
        "4. Provide a high-value circular economy / material recovery / resource-efficiency alternative.\n"
        "5. Assign an implementation priority ('High', 'Medium', or 'Low') based on hotspot severity.\n"
        "6. Return strictly a valid JSON object matching the requested schema. Do not output markdown code blocks or additional text."
    )


def _build_user_prompt(data: AIRecommendationRequest) -> str:
    """
    Format request data into a structured context for the LLM.
    """
    lines = [
        "Please analyze the following verified factory emission and operational data:",
        f"- Factory Name: {data.factory_name or 'N/A'}",
        f"- Industry Type: {data.industry_type or 'N/A'}",
        f"- Total Calculated Emissions: {data.total_co2 or 0.0:.2f} kg CO2e",
        f"- Identified Primary Hotspot: {data.hotspot or 'None'} ({data.hotspot_percentage or 0.0:.1f}%)",
        "- Category Emissions Breakdown:",
        f"  * Electricity CO2e: {data.electricity_co2 or 0.0:.2f} kg CO2e",
        f"  * Fuel CO2e: {data.fuel_co2 or 0.0:.2f} kg CO2e",
        f"  * Material CO2e: {data.material_co2 or 0.0:.2f} kg CO2e",
        f"  * Waste CO2e: {data.waste_co2 or 0.0:.2f} kg CO2e",
        "- Operational Inputs & Scrap:",
        f"  * Material Type: {data.material_type or 'None'}",
        f"  * Material Quantity: {data.material_quantity or 0.0} units/kg",
        f"  * Plastic Waste: {data.plastic_waste_kg or 0.0} kg",
        f"  * Metal Waste: {data.metal_waste_kg or 0.0} kg",
        f"  * Paper Waste: {data.paper_waste_kg or 0.0} kg",
        f"  * Other Waste: {data.other_waste_kg or 0.0} kg",
    ]

    if data.existing_recommendation:
        lines.append(f"- Deterministic Baseline Recommendation: {data.existing_recommendation}")
    if data.existing_circular_alternative:
        lines.append(f"- Deterministic Baseline Circular Pathway: {data.existing_circular_alternative}")

    lines.append("\nGenerate a JSON response conforming exactly to this structure:")
    lines.append(
        """{
  "summary": "Concise executive overview of the factory's emissions and status",
  "hotspot_explanation": "Detailed engineering explanation of the root cause of the primary hotspot",
  "recommended_actions": [
    "Action item 1 with engineering specifics",
    "Action item 2 with engineering specifics",
    "Action item 3 with engineering specifics"
  ],
  "circular_alternative": "Comprehensive circular alternative, resource recovery, or material reuse pathway",
  "implementation_priority": "High" or "Medium" or "Low",
  "estimated_impact": "Realistic potential decarbonization and operational efficiency impact",
  "note": "AI-generated guidance is advisory. Calculated emissions are deterministic source of truth."
}"""
    )
    return "\n".join(lines)


def generate_ai_recommendation(data: AIRecommendationRequest) -> AIRecommendationResponse:
    """
    Main entry point for generating AI recommendations.
    Uses OpenAI if OPENAI_API_KEY is configured; otherwise safely executes rule-based fallback.
    """
    api_key = (OPENAI_API_KEY or "").strip()

    # Guard: Missing or placeholder API key -> seamless fallback
    is_placeholder = (
        not api_key
        or api_key.lower().startswith("your_")
        or api_key.lower().startswith("placeholder")
        or "api_key" in api_key.lower()
        or api_key.lower() in ("none", "null", "")
        or not api_key.startswith("sk-")
    )
    if is_placeholder:
        logger.info("OpenAI API key not configured or is placeholder. Using deterministic rule-based fallback.")
        return build_rule_based_fallback(data)

    try:
        # Import openai dynamically / use SDK
        from openai import OpenAI

        client = OpenAI(api_key=api_key, timeout=5.0)
        model_name = (OPENAI_MODEL or "gpt-4o-mini").strip()

        response = client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": _build_system_prompt()},
                {"role": "user", "content": _build_user_prompt(data)},
            ],
            response_format={"type": "json_object"},
            temperature=0.3,
            max_tokens=800,
        )

        content = response.choices[0].message.content
        if not content:
            logger.warning("Empty response received from OpenAI. Using rule-based fallback.")
            return build_rule_based_fallback(data)

        parsed = json.loads(content)

        # Validate and construct payload
        payload = RecommendationPayload(
            summary=str(parsed.get("summary", "")).strip() or "Decarbonization assessment completed.",
            hotspot_explanation=str(parsed.get("hotspot_explanation", "")).strip() or "Primary hotspot identified.",
            recommended_actions=list(parsed.get("recommended_actions", [])) or ["Review operational efficiency."],
            circular_alternative=str(parsed.get("circular_alternative", "")).strip() or "Evaluate material recovery options.",
            implementation_priority=str(parsed.get("implementation_priority", "Medium")).capitalize(),
            estimated_impact=str(parsed.get("estimated_impact", "")).strip() or "Decarbonization potential identified.",
            note=str(parsed.get("note", "AI-generated guidance is advisory. Calculated emissions are deterministic source of truth.")),
        )

        return AIRecommendationResponse(
            success=True,
            source="openai",
            recommendation=payload,
        )

    except Exception as exc:
        # Catch network error, auth error, rate limit, JSON error, etc.
        # Log error message safely without leaking secret tokens
        logger.warning(
            "OpenAI API call failed or encountered error (%s: %s). Falling back to deterministic rules.",
            exc.__class__.__name__,
            str(exc),
        )
        return build_rule_based_fallback(data)
