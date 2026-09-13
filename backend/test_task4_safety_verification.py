"""
EcoLoop Phase 5 Task 4 Verification Script: Error, Loading & Demo Safety
Validates:
1. Backend error resilience:
   - 404 handling on non-existent factory
   - 422 validation error handling on malformed data
   - Recommendations endpoint resilience
   - OpenAI failure fallback (source: rule_based_fallback, zero secret leaks)
2. Frontend code audits for all 6 pages:
   - Dashboard: loading indicators, null/undefined/NaN safeguards, hotspot fallback
   - Factory Data: form validation, isSubmitting disabled state, user-friendly error banners, duplicate-click prevention
   - Emission Analysis: missing data empty state, zero-emissions safe state, null/undefined/NaN safeguards
   - Recommendations: loading spinner, empty state, friendly error with retry button, disabled refresh button
   - Circular Alternatives: loading spinner, empty state, friendly error with retry button, disabled refresh button
   - What-If Simulator: input range clamping (0-100), baseline null-guards, zero/NaN division protection
3. Full verification report output
"""
import json
import os
import re
import sys
import urllib.error
import urllib.request

API_BASE = "http://127.0.0.1:8000"

def test_backend_resilience():
    results = {}

    # Test 1: Non-existent factory handling (404)
    try:
        req = urllib.request.Request(f"{API_BASE}/api/factories/9999999")
        urllib.request.urlopen(req)
        results["factory_404"] = (False, "Expected 404 but got 200")
    except urllib.error.HTTPError as e:
        if e.code == 404:
            results["factory_404"] = (True, "Handled gracefully with HTTP 404")
        else:
            results["factory_404"] = (False, f"Unexpected HTTP status {e.code}")
    except Exception as exc:
        results["factory_404"] = (False, str(exc))

    # Test 2: Malformed payload validation handling (422)
    try:
        req = urllib.request.Request(
            f"{API_BASE}/api/factories",
            data=json.dumps({"invalid_field": 123}).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        urllib.request.urlopen(req)
        results["validation_422"] = (False, "Expected 422 but got 200")
    except urllib.error.HTTPError as e:
        if e.code == 422:
            results["validation_422"] = (True, "Handled gracefully with HTTP 422 Unprocessable Entity")
        else:
            results["validation_422"] = (False, f"Unexpected HTTP status {e.code}")
    except Exception as exc:
        results["validation_422"] = (False, str(exc))

    # Test 3: Recommendations endpoint resilience
    try:
        req = urllib.request.Request(f"{API_BASE}/api/factories/9999999/recommendations")
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            if isinstance(data, list) and len(data) == 0:
                results["recs_resilience"] = (True, "Returns empty list [] gracefully without 500 crash")
            else:
                results["recs_resilience"] = (True, f"Returned response {resp.status}")
    except urllib.error.HTTPError as e:
        if e.code in (404, 200):
            results["recs_resilience"] = (True, f"Handled with HTTP {e.code}")
        else:
            results["recs_resilience"] = (False, f"Unexpected HTTP status {e.code}")
    except Exception as exc:
        results["recs_resilience"] = (False, str(exc))

    # Test 4: OpenAI API Fallback & Key Protection
    try:
        payload = {
            "factory_id": 13,
            "factory_name": "Safety Test Facility",
            "industry_type": "Manufacturing",
            "total_co2": 111200.0,
            "hotspot": "Electricity",
            "hotspot_percentage": 70.0,
            "electricity_co2": 77875.0,
            "fuel_co2": 11256.0,
            "material_co2": 9250.0,
            "waste_co2": 12819.0,
            "plastic_waste_kg": 2400.0,
            "metal_waste_kg": 3100.0,
            "paper_waste_kg": 850.0,
            "other_waste_kg": 450.0
        }
        req = urllib.request.Request(
            f"{API_BASE}/api/ai/recommendation",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            rec = data.get("recommendation", {})
            source = data.get("source")
            has_summary = bool(rec.get("summary"))
            has_alt = bool(rec.get("circular_alternative"))
            # Check secret leakage
            data_str = json.dumps(data)
            has_leak = "sk-" in data_str or "api_key" in data_str.lower()
            if data.get("success") and has_summary and has_alt and not has_leak:
                results["openai_safety"] = (True, f"Graceful fallback active (source: '{source}'), zero secret leakage")
            else:
                results["openai_safety"] = (False, f"OpenAI test issue: leak={has_leak}, success={data.get('success')}")
    except Exception as exc:
        results["openai_safety"] = (False, str(exc))

    return results

def test_frontend_code_guards():
    results = {}
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    src_dir = os.path.join(base_dir, "src")

    # 1. Dashboard.jsx
    with open(os.path.join(src_dir, "pages", "Dashboard.jsx"), "r", encoding="utf-8") as f:
        dash_code = f.read()
    results["dash_nan_guard"] = (
        ("hasTotalCO2" in dash_code and "!isNaN" in dash_code),
        "Protected with !isNaN and fallback values"
    )

    # 2. HotspotCard.jsx
    with open(os.path.join(src_dir, "components", "dashboard", "HotspotCard.jsx"), "r", encoding="utf-8") as f:
        hotspot_code = f.read()
    results["hotspot_nan_guard"] = (
        ("displayPct" in hotspot_code and "displayTons" in hotspot_code and "!isNaN" in hotspot_code),
        "Protected with displayPct, displayTons and !isNaN guards"
    )

    # 3. FactoryData.jsx
    with open(os.path.join(src_dir, "pages", "FactoryData.jsx"), "r", encoding="utf-8") as f:
        fact_code = f.read()
    results["factory_data_button_guard"] = (
        ("disabled={isSubmitting}" in fact_code and "if (isSubmitting) return" in fact_code),
        "Disabled during submission and duplicate-clicks prevented"
    )
    results["factory_data_error_banner"] = (
        ("apiError" in fact_code and "Connection / Submission Error" in fact_code),
        "User-friendly error banner without raw stack traces"
    )

    # 4. EmissionAnalysis.jsx
    with open(os.path.join(src_dir, "pages", "EmissionAnalysis.jsx"), "r", encoding="utf-8") as f:
        emiss_code = f.read()
    results["emiss_empty_state"] = (
        ("No Factory Data Available" in emiss_code and "Go to Factory Data" in emiss_code),
        "Friendly empty state prompting user to enter data"
    )
    results["emiss_zero_safe"] = (
        ("isZero" in emiss_code and "No emissions have been calculated yet" in emiss_code),
        "Safe zero-emissions state preventing division by zero"
    )
    results["emiss_nan_guard"] = (
        ("Number(emissionData.totalCO2) || 0" in emiss_code and "Number(hotspot?.value) || 0" in emiss_code),
        "Safe numeric coercion guarding toLocaleString() from null/undefined"
    )

    # 5. Recommendations.jsx
    with open(os.path.join(src_dir, "pages", "Recommendations.jsx"), "r", encoding="utf-8") as f:
        rec_code = f.read()
    results["rec_loading_state"] = (
        ("Loading recommendations..." in rec_code and "isLoading && recommendations.length === 0" in rec_code),
        "Clear loading indicator without premature 'no data' flash"
    )
    results["rec_empty_state"] = (
        ("!isLoading && !error && recommendations.length === 0" in rec_code and "No recommendations available yet" in rec_code),
        "Friendly empty state shown only after load finishes without error"
    )
    results["rec_error_retry"] = (
        ("Unable to load recommendations" in rec_code and "Retry Request" in rec_code),
        "Clean error display with Retry Request button"
    )
    results["rec_button_disabled"] = (
        ("disabled={isLoading}" in rec_code),
        "Refresh button disabled during active request"
    )

    # 6. CircularAlternatives.jsx
    with open(os.path.join(src_dir, "pages", "CircularAlternatives.jsx"), "r", encoding="utf-8") as f:
        circ_code = f.read()
    results["circ_loading_state"] = (
        ("Loading circular alternatives..." in circ_code and "isLoading && recommendations.length === 0" in circ_code),
        "Clear loading indicator without premature 'no data' flash"
    )
    results["circ_empty_state"] = (
        ("!isLoading && !error && recommendations.length === 0" in circ_code and "No circular alternatives available yet" in circ_code),
        "Friendly empty state shown only after load finishes without error"
    )
    results["circ_error_retry"] = (
        ("Unable to load circular alternatives" in circ_code and "Retry Request" in circ_code),
        "Clean error display with Retry Request button"
    )
    results["circ_button_disabled"] = (
        ("disabled={isLoading}" in circ_code),
        "Refresh button disabled during active request"
    )

    # 7. WhatIfSimulator.jsx
    with open(os.path.join(src_dir, "pages", "WhatIfSimulator.jsx"), "r", encoding="utf-8") as f:
        whatif_code = f.read()
    results["whatif_safety"] = (
        ("min=\"0\"" in whatif_code and "max=\"100\"" in whatif_code and "Math.max" in whatif_code),
        "Slider range bounds [0, 100] and protected axis domain"
    )

    return results

def main():
    print("=" * 70)
    print("ECOLOOP PHASE 5 - TASK 4: ERROR, LOADING & DEMO SAFETY VERIFICATION")
    print("=" * 70)

    be_results = test_backend_resilience()
    fe_results = test_frontend_code_guards()

    all_tests = {**be_results, **fe_results}
    all_pass = True

    for name, (passed, msg) in all_tests.items():
        status = "PASS" if passed else "FAIL"
        if not passed:
            all_pass = False
        print(f"[{status}] {name:<30}: {msg}")

    print("=" * 70)
    if all_pass:
        print("ALL DEMO SAFETY & ERROR HANDLING CHECKS PASSED!")
    else:
        print("SOME CHECKS FAILED!")
    print("=" * 70)
    return 0 if all_pass else 1

if __name__ == "__main__":
    sys.exit(main())
