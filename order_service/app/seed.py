from __future__ import annotations

from .db import session_scope, init_db
from . import models


def run():
    init_db()
    with session_scope() as session:
        # Products
        products = [
            models.Product(sku="SKU-001", name="Widget", price=9.99, stock_qty=100),
            models.Product(sku="SKU-002", name="Gadget", price=19.99, stock_qty=50),
            models.Product(sku="SKU-003", name="Thingamajig", price=4.99, stock_qty=250),
        ]
        for p in products:
            exists = session.query(models.Product).filter_by(sku=p.sku).first()
            if not exists:
                session.add(p)

        # Customers
        customers = [
            models.Customer(email="alice@example.com", name="Alice"),
            models.Customer(email="bob@example.com", name="Bob"),
        ]
        for c in customers:
            exists = session.query(models.Customer).filter_by(email=c.email).first()
            if not exists:
                session.add(c)


if __name__ == "__main__":
    run()

