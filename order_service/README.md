# Order Management Service

A minimal FastAPI + SQLAlchemy service for managing products, customers, and orders.

## Quickstart

1. Install dependencies (system Python)
```bash
python3 -m pip install --user -r requirements.txt
```

2. Seed sample data
```bash
python3 -m app.seed
```

3. Run the server
```bash
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Open the docs at `http://localhost:8000/docs`.

## Config

- SQLite database path: `./orders.db` (override with `DATABASE_URL`)

