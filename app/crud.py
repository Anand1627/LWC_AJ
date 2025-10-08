from __future__ import annotations

from decimal import Decimal
from typing import Iterable

from sqlalchemy import select
from sqlalchemy.orm import Session

from app import models


# Customers
def create_customer(db: Session, name: str, email: str) -> models.Customer:
	customer = models.Customer(name=name, email=email)
	db.add(customer)
	db.commit()
	db.refresh(customer)
	return customer


def get_customer(db: Session, customer_id: int) -> models.Customer | None:
	return db.get(models.Customer, customer_id)


def list_customers(db: Session, skip: int = 0, limit: int = 50) -> list[models.Customer]:
	stmt = select(models.Customer).offset(skip).limit(limit)
	return list(db.execute(stmt).scalars())


def update_customer(db: Session, customer: models.Customer, *, name: str | None = None) -> models.Customer:
	if name is not None:
		customer.name = name
	db.add(customer)
	db.commit()
	db.refresh(customer)
	return customer


def delete_customer(db: Session, customer: models.Customer) -> None:
	db.delete(customer)
	db.commit()


# Products
def create_product(db: Session, name: str, sku: str, price: Decimal, stock: int) -> models.Product:
	product = models.Product(name=name, sku=sku, price=price, stock=stock)
	db.add(product)
	db.commit()
	db.refresh(product)
	return product


def get_product(db: Session, product_id: int) -> models.Product | None:
	return db.get(models.Product, product_id)


def list_products(db: Session, skip: int = 0, limit: int = 50) -> list[models.Product]:
	stmt = select(models.Product).offset(skip).limit(limit)
	return list(db.execute(stmt).scalars())


def update_product(
	db: Session,
	product: models.Product,
	*,
	name: str | None = None,
	price: Decimal | None = None,
	stock: int | None = None,
) -> models.Product:
	if name is not None:
		product.name = name
	if price is not None:
		product.price = price
	if stock is not None:
		product.stock = stock
	db.add(product)
	db.commit()
	db.refresh(product)
	return product


def delete_product(db: Session, product: models.Product) -> None:
	db.delete(product)
	db.commit()


# Orders
def _ensure_stock_available(db: Session, product: models.Product, quantity: int) -> None:
	if product.stock < quantity:
		raise ValueError(f"Insufficient stock for product {product.id}")


def _reserve_stock(product: models.Product, quantity: int) -> None:
	product.stock -= quantity


def _release_stock(product: models.Product, quantity: int) -> None:
	product.stock += quantity


def create_order(db: Session, customer_id: int, items: Iterable[tuple[int, int]]) -> models.Order:
	order = models.Order(customer_id=customer_id, status=models.OrderStatus.PENDING, total_amount=Decimal("0"))
	db.add(order)
	db.flush()  # obtain order.id

	total_amount = Decimal("0")
	for product_id, quantity in items:
		product = get_product(db, product_id)
		if product is None:
			raise ValueError(f"Product {product_id} not found")
		_ensure_stock_available(db, product, quantity)
		_reserve_stock(product, quantity)
		unit_price = Decimal(product.price)
		line_total = unit_price * quantity
		order_item = models.OrderItem(
			order_id=order.id,
			product_id=product.id,
			quantity=quantity,
			unit_price=unit_price,
			line_total=line_total,
		)
		db.add(order_item)
		total_amount += line_total

	order.total_amount = total_amount
	db.add(order)
	db.commit()
	db.refresh(order)
	return order


def get_order(db: Session, order_id: int) -> models.Order | None:
	return db.get(models.Order, order_id)


def list_orders(db: Session, skip: int = 0, limit: int = 50) -> list[models.Order]:
	stmt = select(models.Order).offset(skip).limit(limit)
	return list(db.execute(stmt).scalars())


def update_order_status(db: Session, order: models.Order, status: models.OrderStatus) -> models.Order:
	order.status = status
	db.add(order)
	db.commit()
	db.refresh(order)
	return order


def cancel_order(db: Session, order: models.Order) -> models.Order:
	if order.status == models.OrderStatus.CANCELLED:
		return order
	# release reserved stock
	for item in order.items:
		_release_stock(item.product, item.quantity)
	order.status = models.OrderStatus.CANCELLED
	db.add(order)
	db.commit()
	db.refresh(order)
	return order
