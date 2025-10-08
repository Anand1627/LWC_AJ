from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import crud, schemas
from app.db import get_db


router = APIRouter(prefix="/products", tags=["products"])


@router.post("/", response_model=schemas.ProductOut, status_code=201)
def create_product(payload: schemas.ProductCreate, db: Session = Depends(get_db)):
	return crud.create_product(db, name=payload.name, sku=payload.sku, price=Decimal(payload.price), stock=payload.stock)


@router.get("/", response_model=list[schemas.ProductOut])
def list_products(skip: int = Query(0, ge=0), limit: int = Query(50, ge=1, le=200), db: Session = Depends(get_db)):
	return crud.list_products(db, skip=skip, limit=limit)


@router.get("/{product_id}", response_model=schemas.ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
	product = crud.get_product(db, product_id)
	if not product:
		raise HTTPException(status_code=404, detail="Product not found")
	return product


@router.patch("/{product_id}", response_model=schemas.ProductOut)
def update_product(product_id: int, payload: schemas.ProductUpdate, db: Session = Depends(get_db)):
	product = crud.get_product(db, product_id)
	if not product:
		raise HTTPException(status_code=404, detail="Product not found")
	return crud.update_product(db, product, name=payload.name, price=payload.price, stock=payload.stock)


@router.delete("/{product_id}", status_code=204)
def delete_product(product_id: int, db: Session = Depends(get_db)):
	product = crud.get_product(db, product_id)
	if not product:
		raise HTTPException(status_code=404, detail="Product not found")
	crud.delete_product(db, product)
	return None
