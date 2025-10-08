from __future__ import annotations

from decimal import Decimal
from typing import List

from pydantic import BaseModel, EmailStr, Field

from app.models import OrderStatus


# Customers
class CustomerBase(BaseModel):
	name: str = Field(..., max_length=200)
	email: EmailStr


class CustomerCreate(CustomerBase):
	pass


class CustomerUpdate(BaseModel):
	name: str | None = Field(None, max_length=200)


class CustomerOut(CustomerBase):
	id: int

	class Config:
		from_attributes = True


# Products
class ProductBase(BaseModel):
	name: str = Field(..., max_length=200)
	sku: str = Field(..., max_length=100)
	price: Decimal = Field(..., ge=0)
	stock: int = Field(0, ge=0)


class ProductCreate(ProductBase):
	pass


class ProductUpdate(BaseModel):
	name: str | None = Field(None, max_length=200)
	price: Decimal | None = Field(None, ge=0)
	stock: int | None = Field(None, ge=0)


class ProductOut(ProductBase):
	id: int

	class Config:
		from_attributes = True


# Orders
class OrderItemIn(BaseModel):
	product_id: int
	quantity: int = Field(..., gt=0)


class OrderItemOut(BaseModel):
	id: int
	product_id: int
	quantity: int
	unit_price: Decimal
	line_total: Decimal

	class Config:
		from_attributes = True


class OrderCreate(BaseModel):
	customer_id: int
	items: List[OrderItemIn]


class OrderUpdateStatus(BaseModel):
	status: OrderStatus


class OrderOut(BaseModel):
	id: int
	customer_id: int
	status: OrderStatus
	total_amount: Decimal
	items: List[OrderItemOut] = []

	class Config:
		from_attributes = True
