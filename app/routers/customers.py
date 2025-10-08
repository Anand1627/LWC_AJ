from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import crud, schemas
from app.db import get_db


router = APIRouter(prefix="/customers", tags=["customers"])


@router.post("/", response_model=schemas.CustomerOut, status_code=201)
def create_customer(payload: schemas.CustomerCreate, db: Session = Depends(get_db)):
	return crud.create_customer(db, name=payload.name, email=payload.email)


@router.get("/", response_model=list[schemas.CustomerOut])
def list_customers(skip: int = Query(0, ge=0), limit: int = Query(50, ge=1, le=200), db: Session = Depends(get_db)):
	return crud.list_customers(db, skip=skip, limit=limit)


@router.get("/{customer_id}", response_model=schemas.CustomerOut)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
	customer = crud.get_customer(db, customer_id)
	if not customer:
		raise HTTPException(status_code=404, detail="Customer not found")
	return customer


@router.patch("/{customer_id}", response_model=schemas.CustomerOut)
def update_customer(customer_id: int, payload: schemas.CustomerUpdate, db: Session = Depends(get_db)):
	customer = crud.get_customer(db, customer_id)
	if not customer:
		raise HTTPException(status_code=404, detail="Customer not found")
	return crud.update_customer(db, customer, name=payload.name)


@router.delete("/{customer_id}", status_code=204)
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
	customer = crud.get_customer(db, customer_id)
	if not customer:
		raise HTTPException(status_code=404, detail="Customer not found")
	crud.delete_customer(db, customer)
	return None
