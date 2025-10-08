from __future__ import annotations

from decimal import Decimal
from enum import Enum

from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class OrderStatus(str, Enum):
	PENDING = "pending"
	PAID = "paid"
	SHIPPED = "shipped"
	CANCELLED = "cancelled"


class Customer(Base):
	__tablename__ = "customers"

	id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
	name: Mapped[str] = mapped_column(String(200), nullable=False)
	email: Mapped[str] = mapped_column(String(320), nullable=False, unique=True, index=True)
	created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

	orders: Mapped[list[Order]] = relationship("Order", back_populates="customer", cascade="all, delete-orphan")


class Product(Base):
	__tablename__ = "products"

	id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
	name: Mapped[str] = mapped_column(String(200), nullable=False)
	sku: Mapped[str] = mapped_column(String(100), nullable=False, unique=True, index=True)
	price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
	stock: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
	created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

	order_items: Mapped[list[OrderItem]] = relationship("OrderItem", back_populates="product")


class Order(Base):
	__tablename__ = "orders"

	id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
	customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id", ondelete="RESTRICT"), nullable=False, index=True)
	status: Mapped[OrderStatus] = mapped_column(SAEnum(OrderStatus), nullable=False, default=OrderStatus.PENDING)
	total_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=0)
	created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

	customer: Mapped[Customer] = relationship("Customer", back_populates="orders")
	items: Mapped[list[OrderItem]] = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
	__tablename__ = "order_items"

	id: Mapped[int] = mapped_column(Integer, primary_key=True)
	order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
	product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="RESTRICT"), nullable=False, index=True)
	quantity: Mapped[int] = mapped_column(Integer, nullable=False)
	unit_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
	line_total: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)

	order: Mapped[Order] = relationship("Order", back_populates="items")
	product: Mapped[Product] = relationship("Product", back_populates="order_items")
