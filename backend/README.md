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
