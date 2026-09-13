# EcoLoop Backend (FastAPI)

FastAPI backend foundation for EcoLoop — AI-powered Industrial Emission Leak-Point Detector and Circular Alternative Recommender.

---

## 1. Project Structure

```
backend/
├── app/
│   ├── __init__.py          # Package initializer
│   ├── main.py              # FastAPI app initialization, middleware & routes
│   ├── config.py            # Environment settings & CORS configuration
│   ├── routes/              # API endpoints
│   │   ├── __init__.py
│   │   └── health.py        # /api/health endpoint
│   ├── services/            # Business logic & emission services
│   │   └── __init__.py
│   ├── models/              # Pydantic schemas & data models
│   │   └── __init__.py
│   └── database/            # Database session & ORM models (Phase 3 Task 2)
│       └── __init__.py
├── .env.example             # Configuration template
├── .gitignore               # Ignored files (venv, .env, __pycache__)
├── requirements.txt         # Python package dependencies
└── README.md                # Documentation & instructions
```

---

## 2. Setup & Installation

### Step 1: Navigate to Backend Directory
```bash
cd EcoLoop/backend
```

### Step 2: Create & Activate Virtual Environment

**On Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

*Note: If PowerShell restricts script execution, activate via Command Prompt:*
```cmd
venv\Scripts\activate
```

**On macOS / Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

---

## 3. Run the Development Server

Start the FastAPI application with live-reload:

```bash
uvicorn app.main:app --reload
```

The server will be available at:
- **Root API**: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- **Health Check**: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)
- **Interactive Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc Documentation**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## 4. CORS Configuration

CORS is configured in `app/main.py` and `app/config.py` to allow requests from the React + Vite frontend running at:
- `http://localhost:5173`
- Allowed HTTP Methods: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`

---

## 5. AI Recommendation Service (Phase 4 Task 3)

The AI Recommendation endpoint accepts calculated emissions and factory operational parameters, generating structured decarbonization initiatives and circular alternatives.

### Environment Setup
Add your OpenAI key in `backend/.env`:
```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
```

> **Fallback Guarantee**: If `OPENAI_API_KEY` is not provided or if external API calls fail, the service automatically and gracefully returns a structured recommendation using the internal deterministic rule engine (`source: "rule_based_fallback"`) without throwing a 500 error.

### Endpoint: `POST /api/ai/recommendation`
**Sample Request:**
```json
{
  "factory_name": "Steel Foundry Plant",
  "industry_type": "Metals Manufacturing",
  "hotspot": "Electricity",
  "hotspot_percentage": 65.0,
  "total_co2": 8000.0,
  "electricity_co2": 5200.0,
  "fuel_co2": 1500.0,
  "material_co2": 800.0,
  "waste_co2": 500.0,
  "material_type": "Steel",
  "plastic_waste_kg": 100.0,
  "metal_waste_kg": 400.0
}
```

**Sample Response:**
```json
{
  "success": true,
  "source": "openai",
  "recommendation": {
    "summary": "Executive decarbonization summary...",
    "hotspot_explanation": "Root cause analysis of the primary hotspot...",
    "recommended_actions": [
      "Targeted engineering initiative 1",
      "Targeted engineering initiative 2"
    ],
    "circular_alternative": "Closed-loop circular recovery and material substitution pathway",
    "implementation_priority": "High",
    "estimated_impact": "Indicative emission reduction and cost metrics",
    "note": "AI-generated guidance is advisory. Calculated emissions are deterministic source of truth."
  }
}
```

### Running the Test Suite
```powershell
.\venv\Scripts\python.exe test_ai_recommendations.py
```

---

## 6. Recommendations MySQL Persistence (Phase 4 Task 4)

Persists generated recommendations (AI-driven or deterministic rule-based) into the existing MySQL `recommendations` table.

### Endpoints
- **`POST /api/recommendations`**: Save a new recommendation (returns HTTP 201 Created).
- **`GET /api/recommendations/{recommendation_id}`**: Retrieve recommendation by ID.
- **`GET /api/factories/{factory_id}/recommendations`**: Retrieve all saved recommendations for a specific factory.

### Sample Request (`POST /api/recommendations`):
```json
{
  "factory_id": 1,
  "hotspot": "Electricity",
  "recommendation": "Improve energy efficiency and increase renewable energy usage.",
  "circular_alternative": "Use renewable electricity and energy-efficient equipment.",
  "estimated_cost": 500000,
  "estimated_co2_reduction": 150000,
  "priority": "High"
}
```

### Running the Persistence Test Suite:
```powershell
.\venv\Scripts\python.exe test_recommendations_mysql.py
```
