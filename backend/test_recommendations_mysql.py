"""
EcoLoop Recommendations MySQL Persistence Test Suite (Phase 4 Task 4)
Tests:
1. POST /api/recommendations (Save recommendation to MySQL)
2. GET /api/recommendations/{id} (Fetch saved recommendation)
3. GET /api/factories/{factory_id}/recommendations (Fetch factory recommendations)
4. POST /api/recommendations with non-existent factory_id -> 404
5. GET /api/recommendations/{id} with non-existent id -> 404
6. GET /api/factories/{factory_id}/recommendations non-existent -> 404
7. Schema Validation Constraints (invalid priority, negative values, empty hotspot) -> 422
8. Direct MySQL Table Row Verification
9. AI Recommendation to Database Persistence Compatibility Flow
10. Existing Endpoints Intact Check
"""
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from sqlalchemy import text
from app.main import app
from app.database.connection import engine, SessionLocal
from app.models.factory import Factory
from app.models.recommendation import Recommendation

client = TestClient(app)


def run_tests():
    print("==================================================")
    print("STARTING PHASE 4 TASK 4 VERIFICATION TESTS")
    print("==================================================")

    passed_count = 0
    total_tests = 10

    # Ensure at least one factory exists in database for testing
    db = SessionLocal()
    factory = db.query(Factory).first()
    if not factory:
        factory = Factory(
            name="Phase 4 Task 4 Test Facility",
            location="Industrial Zone Sector 9",
            industry_type="Heavy Manufacturing",
        )
        db.add(factory)
        db.commit()
        db.refresh(factory)
    test_factory_id = factory.id
    db.close()
    print(f"[*] Using Test Factory ID: {test_factory_id}")

    saved_rec_id = None

    # -------------------------------------------------------------
    # TEST 1: POST /api/recommendations
    # -------------------------------------------------------------
    print("\n--- TEST 1: Save Recommendation to MySQL (POST /api/recommendations) ---")
    rec_payload = {
        "factory_id": test_factory_id,
        "hotspot": "Electricity",
        "recommendation": "Improve energy efficiency and increase renewable energy usage.",
        "circular_alternative": "Use renewable electricity and energy-efficient equipment.",
        "estimated_cost": 500000.0,
        "estimated_co2_reduction": 150000.0,
        "priority": "High",
    }
    response = client.post("/api/recommendations", json=rec_payload)
    assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
    data = response.json()
    assert "id" in data and data["id"] > 0
    assert data["factory_id"] == test_factory_id
    assert data["hotspot"] == "Electricity"
    assert data["priority"] == "High"
    assert data["estimated_cost"] == 500000.0
    assert data["estimated_co2_reduction"] == 150000.0
    assert "created_at" in data
    saved_rec_id = data["id"]
    print(f"[PASS] TEST 1: Successfully saved recommendation with id={saved_rec_id}.")
    passed_count += 1

    # -------------------------------------------------------------
    # TEST 2: GET /api/recommendations/{recommendation_id}
    # -------------------------------------------------------------
    print("\n--- TEST 2: Retrieve Recommendation by ID (GET /api/recommendations/{id}) ---")
    response = client.get(f"/api/recommendations/{saved_rec_id}")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    assert data["id"] == saved_rec_id
    assert data["factory_id"] == test_factory_id
    assert data["hotspot"] == "Electricity"
    assert "energy efficiency" in data["recommendation"].lower()
    print(f"[PASS] TEST 2: Successfully retrieved recommendation id={saved_rec_id}.")
    passed_count += 1

    # -------------------------------------------------------------
    # TEST 3: GET /api/factories/{factory_id}/recommendations
    # -------------------------------------------------------------
    print("\n--- TEST 3: Retrieve Factory Recommendations (GET /api/factories/{factory_id}/recommendations) ---")
    response = client.get(f"/api/factories/{test_factory_id}/recommendations")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    matching = [r for r in data if r["id"] == saved_rec_id]
    assert len(matching) == 1
    print(f"[PASS] TEST 3: Found {len(data)} recommendations for factory_id={test_factory_id}.")
    passed_count += 1

    # -------------------------------------------------------------
    # TEST 4: POST with Non-Existent Factory ID -> 404
    # -------------------------------------------------------------
    print("\n--- TEST 4: 404 on POST with Non-Existent Factory ID ---")
    invalid_factory_payload = {
        "factory_id": 9999999,
        "hotspot": "Fuel",
        "recommendation": "Transition to electric heat pump systems.",
        "circular_alternative": "Electrify low-temperature process heat.",
        "estimated_cost": 250000.0,
        "estimated_co2_reduction": 80000.0,
        "priority": "Medium",
    }
    response = client.post("/api/recommendations", json=invalid_factory_payload)
    assert response.status_code == 404, f"Expected 404, got {response.status_code}: {response.text}"
    assert "not found" in response.json()["detail"].lower()
    print("[PASS] TEST 4: Returned HTTP 404 for non-existent factory.")
    passed_count += 1

    # -------------------------------------------------------------
    # TEST 5: GET Non-Existent Recommendation ID -> 404
    # -------------------------------------------------------------
    print("\n--- TEST 5: 404 on GET Non-Existent Recommendation ID ---")
    response = client.get("/api/recommendations/9999999")
    assert response.status_code == 404, f"Expected 404, got {response.status_code}: {response.text}"
    assert "not found" in response.json()["detail"].lower()
    print("[PASS] TEST 5: Returned HTTP 404 for non-existent recommendation ID.")
    passed_count += 1

    # -------------------------------------------------------------
    # TEST 6: GET Recommendations for Non-Existent Factory -> 404
    # -------------------------------------------------------------
    print("\n--- TEST 6: 404 on GET Recommendations for Non-Existent Factory ---")
    response = client.get("/api/factories/9999999/recommendations")
    assert response.status_code == 404, f"Expected 404, got {response.status_code}: {response.text}"
    assert "not found" in response.json()["detail"].lower()
    print("[PASS] TEST 6: Returned HTTP 404 for non-existent factory in list query.")
    passed_count += 1

    # -------------------------------------------------------------
    # TEST 7: Pydantic Validation Constraints -> 422
    # -------------------------------------------------------------
    print("\n--- TEST 7: Input Validation Constraints (422) ---")
    # Invalid priority
    bad_priority = rec_payload.copy()
    bad_priority["priority"] = "UrgentCritical"
    r = client.post("/api/recommendations", json=bad_priority)
    assert r.status_code == 422, f"Expected 422 for invalid priority, got {r.status_code}"

    # Negative cost
    neg_cost = rec_payload.copy()
    neg_cost["estimated_cost"] = -100.0
    r = client.post("/api/recommendations", json=neg_cost)
    assert r.status_code == 422, f"Expected 422 for negative cost, got {r.status_code}"

    # Empty hotspot
    empty_hotspot = rec_payload.copy()
    empty_hotspot["hotspot"] = "   "
    r = client.post("/api/recommendations", json=empty_hotspot)
    assert r.status_code == 422, f"Expected 422 for empty hotspot, got {r.status_code}"

    # factory_id <= 0
    zero_factory = rec_payload.copy()
    zero_factory["factory_id"] = 0
    r = client.post("/api/recommendations", json=zero_factory)
    assert r.status_code == 422, f"Expected 422 for factory_id=0, got {r.status_code}"

    print("[PASS] TEST 7: Pydantic validation rejected invalid priority, negative cost, empty hotspot, and zero factory_id.")
    passed_count += 1

    # -------------------------------------------------------------
    # TEST 8: Direct MySQL Verification
    # -------------------------------------------------------------
    print("\n--- TEST 8: Direct MySQL Database Verification ---")
    with engine.connect() as conn:
        result = conn.execute(
            text("SELECT id, factory_id, hotspot, priority, estimated_cost, estimated_co2_reduction, created_at FROM recommendations WHERE id = :id"),
            {"id": saved_rec_id}
        ).fetchone()
        assert result is not None, f"Row with id={saved_rec_id} not found in MySQL recommendations table"
        assert result[1] == test_factory_id
        assert result[2] == "Electricity"
        assert result[3] == "High"
        assert abs(result[4] - 500000.0) < 1e-3
        assert abs(result[5] - 150000.0) < 1e-3
        print(f"[PASS] TEST 8: Verified row in MySQL ecoloop_db.recommendations: id={result[0]}, hotspot='{result[2]}', priority='{result[3]}'.")
        passed_count += 1

    # -------------------------------------------------------------
    # TEST 9: AI Recommendation Endpoint to Database Compatibility
    # -------------------------------------------------------------
    print("\n--- TEST 9: AI Recommendation Output Persistence Compatibility ---")
    # Call AI recommendation endpoint (which uses rule_based_fallback when no OpenAI key is set)
    ai_req = {
        "factory_name": "Test Factory Auto",
        "hotspot": "Waste",
        "hotspot_percentage": 60.0,
        "total_co2": 5000.0,
        "waste_co2": 3000.0,
        "plastic_waste_kg": 400.0,
    }
    ai_res = client.post("/api/ai/recommendation", json=ai_req)
    assert ai_res.status_code == 200
    ai_data = ai_res.json()
    assert ai_data["success"] is True
    rec_obj = ai_data["recommendation"]

    # Map AI payload to RecommendationCreate
    actions_summary = "; ".join(rec_obj.get("recommended_actions", []))
    ai_to_db_payload = {
        "factory_id": test_factory_id,
        "hotspot": "Waste",
        "recommendation": actions_summary or rec_obj.get("summary", ""),
        "circular_alternative": rec_obj.get("circular_alternative", ""),
        "estimated_cost": 12000.0,
        "estimated_co2_reduction": 3600.0,
        "priority": rec_obj.get("implementation_priority", "High"),
    }
    db_save_res = client.post("/api/recommendations", json=ai_to_db_payload)
    assert db_save_res.status_code == 201
    saved_ai_rec = db_save_res.json()
    assert saved_ai_rec["id"] > 0
    assert saved_ai_rec["hotspot"] == "Waste"
    print(f"[PASS] TEST 9: Successfully persisted AI recommendation output to MySQL with id={saved_ai_rec['id']}.")
    passed_count += 1

    # -------------------------------------------------------------
    # TEST 10: Existing Endpoints Health Check
    # -------------------------------------------------------------
    print("\n--- TEST 10: Existing APIs Health & Integrity Check ---")
    r_root = client.get("/")
    assert r_root.status_code == 200

    r_health = client.get("/api/health")
    assert r_health.status_code == 200
    assert r_health.json()["status"] == "ok"

    r_db = client.get("/api/database/health")
    assert r_db.status_code == 200
    assert r_db.json()["status"] == "ok"
    assert "successful" in r_db.json()["message"].lower()

    r_factories = client.get("/api/factories")
    assert r_factories.status_code == 200

    print("[PASS] TEST 10: Pre-existing APIs (/, /api/health, /api/database/health, /api/factories, /api/ai/recommendation) remain 100% operational.")
    passed_count += 1

    print("\n==================================================")
    print(f"ALL TESTS COMPLETED: {passed_count}/{total_tests} PASSED")
    print("==================================================")


if __name__ == "__main__":
    run_tests()
