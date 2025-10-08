# Order Management API (FastAPI)

A FastAPI service for managing customers, products, and orders.

## Install

```bash
python3 -m pip install -r requirements.txt
```

## Run

```bash
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Health:
```bash
curl http://127.0.0.1:8000/health
```

OpenAPI/Docs:
- Swagger UI: http://127.0.0.1:8000/docs
- OpenAPI JSON: http://127.0.0.1:8000/openapi.json

## Quickstart

Create customer:
```bash
curl -X POST http://127.0.0.1:8000/customers/ \
  -H 'content-type: application/json' \
  -d '{"name":"Acme Inc","email":"admin@acme.test"}'
```

Create product:
```bash
curl -X POST http://127.0.0.1:8000/products/ \
  -H 'content-type: application/json' \
  -d '{"name":"Widget","sku":"W-100","price":12.5,"stock":100}'
```

Create order:
```bash
curl -X POST http://127.0.0.1:8000/orders/ \
  -H 'content-type: application/json' \
  -d '{"customer_id":1,"items":[{"product_id":1,"quantity":2}]}'
```

Update status:
```bash
curl -X PATCH http://127.0.0.1:8000/orders/1/status \
  -H 'content-type: application/json' \
  -d '{"status":"paid"}'
```

Cancel:
```bash
curl -X POST http://127.0.0.1:8000/orders/1/cancel
```

List endpoints:
- GET `/customers/`, POST `/customers/`, GET `/customers/{id}`, PATCH `/customers/{id}`, DELETE `/customers/{id}`
- GET `/products/`, POST `/products/`, GET `/products/{id}`, PATCH `/products/{id}`, DELETE `/products/{id}`
- GET `/orders/`, POST `/orders/`, GET `/orders/{id}`, PATCH `/orders/{id}/status`, POST `/orders/{id}/cancel`
