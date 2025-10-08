from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, EmailStr, PositiveInt


# Product
class ProductBase(BaseModel):
    sku: str = Field(min_length=1, max_length=64)
    name: str = Field(min_length=1, max_length=255)
    price: float = Field(ge=0)
    stock_qty: int = Field(ge=0)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    price: Optional[float] = Field(default=None, ge=0)
    stock_qty: Optional[int] = Field(default=None, ge=0)


class ProductRead(ProductBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Customer
class CustomerBase(BaseModel):
    email: EmailStr
    name: str = Field(min_length=1, max_length=255)


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)


class CustomerRead(CustomerBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Order
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: PositiveInt


class OrderItemRead(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate]


class OrderRead(BaseModel):
    id: int
    customer_id: int
    status: str
    created_at: datetime
    items: List[OrderItemRead]

    class Config:
        from_attributes = True


class OrderStatusUpdate(BaseModel):
    status: str

