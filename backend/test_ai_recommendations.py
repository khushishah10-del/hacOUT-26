"""
EcoLoop AI Recommendation API Verification Test Suite
Tests Phase 4 Task 3 implementations:
1. Missing API Key Fallback
2. OpenAI Mock Response Processing
3. Electricity Hotspot Analysis
4. Fuel Hotspot Analysis
5. Waste Hotspot Analysis
6. Malformed Response / Error Fallback
7. Existing Endpoints Intact Check
"""
import sys
import os
from unittest.mock import patch, MagicMock

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from app.schemas.ai_recommendation import AIRecommendationRequest, AIRecommendationResponse
from app.services.openai_service import generate_ai_recommendation, build_rule_based_fallback

client = TestClient(app)

def run_tests():
    print("==================================================")
    print("STARTING PHASE 4 TASK 3 VERIFICATION TESTS")
    print("==================================================")

    passed_count = 0
    total_tests = 7

    # -------------------------------------------------------------
    # TEST 1: OpenAI Response Parsing (Mocked OpenAI SDK response)
    # -------------------------------------------------------------
    print("\n--- TEST 1: OpenAI Response Parsing (Mocked API) ---")
    mock_choice = MagicMock()
    mock_choice.message.content = """{
        "summary": "AI Decarbonization Plan for Test Foundry",
        "hotspot_explanation": "Electricity accounts for 65% of emissions due to continuous furnace melting operations.",
        "recommended_actions": [
            "Install variable frequency drives (VFDs) on all extraction fans.",
            "Schedule heavy batch melting during off-peak tariff windows.",
            "Commission rooftop solar PV array to displace 25% of baseline grid load."
        ],
        "circular_alternative": "Deploy waste heat recovery heat exchangers to generate pre-heated water for facility services.",
        "implementation_priority": "High",
        "estimated_impact": "Potential 22% CO2e reduction (~2,500 kg CO2e/month) with estimated 14-month ROI.",
        "note": "AI-generated guidance is advisory. Calculated emissions are deterministic source of truth."
    }"""
    mock_response = MagicMock()
    mock_response.choices = [mock_choice]

    req_payload = {
        "factory_name": "Test Foundry Alpha",
        "industry_type": "Metals Manufacturing",
        "hotspot": "Electricity",
        "hotspot_percentage": 65.0,
        "electricity_co2": 5200.0,
        "fuel_co2": 1500.0,
        "material_co2": 800.0,
        "waste_co2": 500.0,
        "total_co2": 8000.0,
        "material_type": "Steel",
        "material_quantity": 1000.0,
    }

    with patch("app.services.openai_service.OPENAI_API_KEY", "sk-mock-valid-test-key"):
        with patch("openai.OpenAI") as mock_openai_cls:
            mock_client = MagicMock()
            mock_client.chat.completions.create.return_value = mock_response
            mock_openai_cls.return_value = mock_client

            response = client.post("/api/ai/recommendation", json=req_payload)
            assert response.status_code == 200, f"Expected 200, got {response.status_code}"
            data = response.json()
            assert data["success"] is True
            assert data["source"] == "openai"
            assert "AI Decarbonization Plan" in data["recommendation"]["summary"]
            assert len(data["recommendation"]["recommended_actions"]) == 3
            assert data["recommendation"]["implementation_priority"] == "High"
            print("[PASS] TEST 1: Successfully generated AI recommendation with source='openai'.")
            passed_count += 1

    # -------------------------------------------------------------
    # TEST 2: Missing API Key -> Graceful Fallback
    # -------------------------------------------------------------
    print("\n--- TEST 2: Missing API Key Fallback ---")
    with patch("app.services.openai_service.OPENAI_API_KEY", ""):
        response = client.post("/api/ai/recommendation", json=req_payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data["success"] is True
        assert data["source"] == "rule_based_fallback"
        assert "Electricity" in data["recommendation"]["hotspot_explanation"]
        assert len(data["recommendation"]["recommended_actions"]) > 0
        assert data["recommendation"]["implementation_priority"] in ["High", "Medium", "Low"]
        print("[PASS] TEST 2: Empty API key safely falls back with source='rule_based_fallback'.")
        passed_count += 1

    # -------------------------------------------------------------
    # TEST 3: Electricity Hotspot Scenario
    # -------------------------------------------------------------
    print("\n--- TEST 3: Electricity Hotspot Scenario ---")
    elec_payload = {
        "factory_name": "GreenVolt Electronics",
        "industry_type": "Electronics Assembly",
        "hotspot": "Electricity",
        "hotspot_percentage": 75.0,
        "electricity_co2": 4500.0,
        "fuel_co2": 300.0,
        "material_co2": 600.0,
        "waste_co2": 600.0,
        "total_co2": 6000.0,
    }
    with patch("app.services.openai_service.OPENAI_API_KEY", ""):
        response = client.post("/api/ai/recommendation", json=elec_payload)
        assert response.status_code == 200
        data = response.json()
        rec = data["recommendation"]
        assert rec["implementation_priority"] == "High"
        assert "renewable" in rec["circular_alternative"].lower() or "energy" in rec["circular_alternative"].lower()
        print("[PASS] TEST 3: Electricity hotspot generated targeted recommendations & circular alternatives.")
        passed_count += 1

    # -------------------------------------------------------------
    # TEST 4: Fuel Hotspot Scenario
    # -------------------------------------------------------------
    print("\n--- TEST 4: Fuel Hotspot Scenario ---")
    fuel_payload = {
        "factory_name": "Thermal Dynamics Ltd",
        "industry_type": "Ceramics",
        "hotspot": "Fuel",
        "hotspot_percentage": 68.0,
        "electricity_co2": 800.0,
        "fuel_co2": 3400.0,
        "material_co2": 400.0,
        "waste_co2": 400.0,
        "total_co2": 5000.0,
    }
    with patch("app.services.openai_service.OPENAI_API_KEY", ""):
        response = client.post("/api/ai/recommendation", json=fuel_payload)
        assert response.status_code == 200
        data = response.json()
        rec = data["recommendation"]
        assert rec["implementation_priority"] == "High"
        assert "fuel" in rec["hotspot_explanation"].lower() or "combustion" in rec["hotspot_explanation"].lower()
        assert "electric" in rec["circular_alternative"].lower() or "heat" in rec["circular_alternative"].lower()
        print("[PASS] TEST 4: Fuel hotspot generated thermal efficiency and electrification alternatives.")
        passed_count += 1

    # -------------------------------------------------------------
    # TEST 5: Waste Hotspot Scenario
    # -------------------------------------------------------------
    print("\n--- TEST 5: Waste Hotspot Scenario ---")
    waste_payload = {
        "factory_name": "EcoPack Polymers",
        "industry_type": "Packaging",
        "hotspot": "Waste",
        "hotspot_percentage": 55.0,
        "electricity_co2": 900.0,
        "fuel_co2": 400.0,
        "material_co2": 500.0,
        "waste_co2": 2200.0,
        "total_co2": 4000.0,
        "plastic_waste_kg": 500.0,
        "metal_waste_kg": 100.0,
    }
    with patch("app.services.openai_service.OPENAI_API_KEY", ""):
        response = client.post("/api/ai/recommendation", json=waste_payload)
        assert response.status_code == 200
        data = response.json()
        rec = data["recommendation"]
        assert rec["implementation_priority"] == "High"
        assert "waste" in rec["hotspot_explanation"].lower() or "scrap" in rec["hotspot_explanation"].lower()
        assert "plastic" in rec["circular_alternative"].lower()
        print("[PASS] TEST 5: Waste hotspot detected dominant plastic scrap stream and circular recovery strategy.")
        passed_count += 1

    # -------------------------------------------------------------
    # TEST 6: Malformed / Invalid OpenAI Response Fallback
    # -------------------------------------------------------------
    print("\n--- TEST 6: Malformed OpenAI Response Graceful Fallback ---")
    mock_bad_choice = MagicMock()
    mock_bad_choice.message.content = "INVALID_NON_JSON_OUTPUT_OR_CORRUPT"
    mock_bad_response = MagicMock()
    mock_bad_response.choices = [mock_bad_choice]

    with patch("app.services.openai_service.OPENAI_API_KEY", "sk-valid-but-model-glitched"):
        with patch("openai.OpenAI") as mock_openai_cls:
            mock_client = MagicMock()
            mock_client.chat.completions.create.return_value = mock_bad_response
            mock_openai_cls.return_value = mock_client

            response = client.post("/api/ai/recommendation", json=req_payload)
            assert response.status_code == 200, f"Expected 200 despite malformed AI output, got {response.status_code}"
            data = response.json()
            assert data["success"] is True
            assert data["source"] == "rule_based_fallback"
            print("[PASS] TEST 6: Non-JSON or broken AI response gracefully fell back without 500 error.")
            passed_count += 1

    # -------------------------------------------------------------
    # TEST 7: Verify Existing Endpoints Remain Operational
    # -------------------------------------------------------------
    print("\n--- TEST 7: Verify Existing Endpoints Operational ---")
    r_root = client.get("/")
    assert r_root.status_code == 200
    assert r_root.json()["message"] == "Welcome to EcoLoop API"

    r_health = client.get("/api/health")
    assert r_health.status_code == 200
    assert r_health.json()["status"] == "ok"

    r_db = client.get("/api/database/health")
    assert r_db.status_code == 200

    r_factories = client.get("/api/factories")
    assert r_factories.status_code == 200

    print("[PASS] TEST 7: All pre-existing endpoints (/api/health, /api/database/health, /api/factories) fully functional.")
    passed_count += 1

    print("\n==================================================")
    print(f"ALL TESTS COMPLETED: {passed_count}/{total_tests} PASSED")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
