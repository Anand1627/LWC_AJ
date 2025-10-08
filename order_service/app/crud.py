from __future__ import annotations

from typing import List

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from . import models, schemas


# Products
def create_product(session: Session, product_in: schemas.ProductCreate) -> models.Product:
    exists = session.scalar(select(models.Product).where(models.Product.sku == product_in.sku))
    if exists:
        raise HTTPException(status_code=400, detail="SKU already exists")
    product = models.Product(**product_in.model_dump())
    session.add(product)
    session.flush()
    return product


def list_products(session: Session) -> List[models.Product]:
    return list(session.scalars(select(models.Product).order_by(models.Product.id)))


def get_product(session: Session, product_id: int) -> models.Product:
    product = session.get(models.Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


def update_product(session: Session, product_id: int, product_in: schemas.ProductUpdate) -> models.Product:
    product = get_product(session, product_id)
    data = product_in.model_dump(exclude_none=True)
    for key, value in data.items():
        setattr(product, key, value)
    session.flush()
    return product


def delete_product(session: Session, product_id: int) -> None:
    product = get_product(session, product_id)
    session.delete(product)


# Customers
def create_customer(session: Session, customer_in: schemas.CustomerCreate) -> models.Customer:
    exists = session.scalar(select(models.Customer).where(models.Customer.email == customer_in.email))
    if exists:
        raise HTTPException(status_code=400, detail="Email already exists")
    customer = models.Customer(**customer_in.model_dump())
    session.add(customer)
    session.flush()
    return customer


def list_customers(session: Session) -> List[models.Customer]:
    return list(session.scalars(select(models.Customer).order_by(models.Customer.id)))


def get_customer(session: Session, customer_id: int) -> models.Customer:
    customer = session.get(models.Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


def update_customer(session: Session, customer_id: int, customer_in: schemas.CustomerUpdate) -> models.Customer:
    customer = get_customer(session, customer_id)
    data = customer_in.model_dump(exclude_none=True)
    for key, value in data.items():
        setattr(customer, key, value)
    session.flush()
    return customer


def delete_customer(session: Session, customer_id: int) -> None:
    customer = get_customer(session, customer_id)
    session.delete(customer)


# Orders
def create_order(session: Session, order_in: schemas.OrderCreate) -> models.Order:
    customer = get_customer(session, order_in.customer_id)
    if not order_in.items:
        raise HTTPException(status_code=400, detail="Order requires at least one item")

    order = models.Order(customer_id=customer.id, status="pending")
    session.add(order)
    session.flush()

    product_ids = [i.product_id for i in order_in.items]
    products = {p.id: p for p in session.scalars(select(models.Product).where(models.Product.id.in_(product_ids)))}

    for item in order_in.items:
        product = products.get(item.product_id)
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        order_item = models.OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=item.quantity,
            unit_price=product.price,
        )
        session.add(order_item)
    session.flush()
    session.refresh(order)
    return order


def list_orders(session: Session) -> List[models.Order]:
    return list(session.scalars(select(models.Order).order_by(models.Order.id)))


def get_order(session: Session, order_id: int) -> models.Order:
    order = session.get(models.Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


def update_order_status(session: Session, order_id: int, status: str) -> models.Order:
    allowed = {"pending", "confirmed", "shipped", "cancelled"}
    if status not in allowed:
        raise HTTPException(status_code=400, detail=f"Status must be one of {sorted(allowed)}")

    order = get_order(session, order_id)

    if order.status == status:
        return order

    # Apply stock adjustments when moving to confirmed; revert if cancelled from confirmed
    if status == "confirmed" and order.status == "pending":
        for item in order.items:
            if item.product.stock_qty < item.quantity:
                raise HTTPException(status_code=400, detail=f"Insufficient stock for product {item.product_id}")
        for item in order.items:
            item.product.stock_qty -= item.quantity
    elif status == "cancelled" and order.status == "confirmed":
        for item in order.items:
            item.product.stock_qty += item.quantity

    order.status = status
    session.flush()
    session.refresh(order)
    return order

