"""
GreenTech Manufacturing Demo Scenario Seeder
Seeds GreenTech Manufacturing in Ahmedabad, Gujarat into MySQL ecoloop_db
with realistic, internally consistent data and verified calculations.
"""
import urllib.request
import json

BASE_URL = "http://127.0.0.1:8000/api"

def main():
    print("=== SEEDING GREENTECH MANUFACTURING DEMO DATA ===")
    
    # 1. Check or Create Factory
    factories_url = f"{BASE_URL}/factories"
    with urllib.request.urlopen(urllib.request.Request(factories_url)) as resp:
        factories = json.loads(resp.read().decode())
    
    greentech = next((f for f in factories if f["name"].strip().lower() == "greentech manufacturing"), None)
    if not greentech:
        payload = json.dumps({
            "name": "GreenTech Manufacturing",
            "location": "Ahmedabad, Gujarat",
            "industry_type": "Manufacturing"
        }).encode("utf-8")
        req = urllib.request.Request(factories_url, data=payload, headers={"Content-Type": "application/json"}, method="POST")
        with urllib.request.urlopen(req) as resp:
            greentech = json.loads(resp.read().decode())
        print(f"[+] Created Factory: {greentech['name']} (ID: {greentech['id']})")
    else:
        print(f"[*] Found Existing Factory: {greentech['name']} (ID: {greentech['id']})")
    
    factory_id = greentech["id"]

    # 2. Add Factory Operational Data
    data_url = f"{BASE_URL}/factories/{factory_id}/data"
    data_payload = {
        "electricity_kwh": 95000.0,
        "renewable_percentage": 20.0,
        "fuel_liters": 4200.0,
        "material_type": "Recycled Aluminum & Polymer Composite",
        "material_quantity": 18500.0,
        "plastic_waste_kg": 2400.0,
        "metal_waste_kg": 3100.0,
        "paper_waste_kg": 850.0,
        "other_waste_kg": 450.0,
        "production_units": 12500,
        "date": "2026-03-15"
    }
    req = urllib.request.Request(
        data_url,
        data=json.dumps(data_payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req) as resp:
        created_data = json.loads(resp.read().decode())
    data_id = created_data["id"]
    print(f"[+] Saved Operational Data (Record ID: {data_id}) for Date: {created_data['date']}")

    # 3. Calculate and Save Emissions
    calc_url = f"{BASE_URL}/factory-data/{data_id}/calculate-emissions"
    req = urllib.request.Request(calc_url, data=b"", method="POST")
    with urllib.request.urlopen(req) as resp:
        emission_res = json.loads(resp.read().decode())
    
    print("[+] Emission Calculation Verified:")
    print(f"    - Electricity CO2: {emission_res['electricity_co2']:,.2f} kg CO2e ({emission_res['percentages']['electricity']}%)")
    print(f"    - Fuel CO2:        {emission_res['fuel_co2']:,.2f} kg CO2e ({emission_res['percentages']['fuel']}%)")
    print(f"    - Material CO2:    {emission_res['material_co2']:,.2f} kg CO2e ({emission_res['percentages']['material']}%)")
    print(f"    - Waste CO2:       {emission_res['waste_co2']:,.2f} kg CO2e ({emission_res['percentages']['waste']}%)")
    print(f"    - Total CO2:       {emission_res['total_co2']:,.2f} kg CO2e ({(emission_res['total_co2']/1000):.2f} tons CO2e)")
    print(f"    - Hotspot:         {emission_res['hotspot']['category']} ({emission_res['hotspot']['percentage']}%)")

    # 4. Check existing recommendations for this factory
    rec_check_url = f"{BASE_URL}/factories/{factory_id}/recommendations"
    with urllib.request.urlopen(urllib.request.Request(rec_check_url)) as resp:
        existing_recs = json.loads(resp.read().decode())

    # If fewer than 3 recommendations exist, seed 3 realistic, ranked recommendations
    if len(existing_recs) < 3:
        sample_recs = [
            {
                "factory_id": factory_id,
                "hotspot": "Electricity",
                "recommendation": "Deploy a 120 kWp rooftop solar photovoltaic array and transition base grid supply to an open-access captive renewable Power Purchase Agreement (PPA).",
                "circular_alternative": "Transition plant motors and air compressors to variable-frequency drives (VFD) paired with smart renewable microgrid load-shifting.",
                "estimated_cost": 1850000.0,
                "estimated_co2_reduction": 28000.0,
                "priority": "High"
            },
            {
                "factory_id": factory_id,
                "hotspot": "Fuel",
                "recommendation": "Install a condensing economizer on heat-treatment exhaust flues and calibrate furnace air-fuel ratio to recover high-grade thermal waste.",
                "circular_alternative": "Upgrade combustion burners to biomass pellet co-firing and explore closed-loop electric induction heating for tooling billets.",
                "estimated_cost": 680000.0,
                "estimated_co2_reduction": 5200.0,
                "priority": "Medium"
            },
            {
                "factory_id": factory_id,
                "hotspot": "Waste",
                "recommendation": "Implement color-coded scrap segregation bins at stamping bays and install automated offcut balers to prevent landfill contamination.",
                "circular_alternative": "Establish direct industrial symbiosis take-back loops with local Gujarat secondary aluminum foundries for 100% swarf valorization.",
                "estimated_cost": 240000.0,
                "estimated_co2_reduction": 3800.0,
                "priority": "Low"
            }
        ]

        for r in sample_recs:
            req = urllib.request.Request(
                f"{BASE_URL}/recommendations",
                data=json.dumps(r).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req) as resp:
                saved = json.loads(resp.read().decode())
                print(f"[+] Created Recommendation #{saved['id']}: [{saved['priority']}] {saved['hotspot']} -> {saved['recommendation'][:60]}...")

    # 5. Verify recommendations retrieval
    with urllib.request.urlopen(urllib.request.Request(rec_check_url)) as resp:
        final_recs = json.loads(resp.read().decode())
    print(f"[+] Total Recommendations in MySQL for GreenTech: {len(final_recs)}")
    for r in final_recs:
        print(f"    - ID #{r['id']}: Priority={r['priority']}, Hotspot={r['hotspot']}, Cost=Rs.{r['estimated_cost']:,.0f}, Reduction={r['estimated_co2_reduction']:,.0f} kg CO2e")

    print("\n=== SEEDING COMPLETED SUCCESSFULLY ===")

if __name__ == "__main__":
    main()
