from fastapi import FastAPI
from sqlalchemy.orm import Session

from app.db import Base, engine
from app.routers import customers, orders, products

def create_app() -> FastAPI:
	app = FastAPI(title="Order Management API", version="0.1.0")

	@app.get("/health")
	def health() -> dict:
		return {"status": "ok"}

	# Create tables on startup (for demo/dev)
	Base.metadata.create_all(bind=engine)

	# Routers
	app.include_router(customers.router)
	app.include_router(products.router)
	app.include_router(orders.router)

	return app


app = create_app()
