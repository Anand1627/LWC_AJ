from __future__ import annotations

from fastapi import FastAPI

from .db import init_db
from .routers import products, customers, orders


def create_app() -> FastAPI:
    init_db()
    application = FastAPI(title="Order Management Service", version="0.1.0")
    application.include_router(products.router)
    application.include_router(customers.router)
    application.include_router(orders.router)
    return application


app = create_app()

