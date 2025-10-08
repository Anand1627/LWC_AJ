from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.db import get_db


router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("/", response_model=schemas.OrderOut, status_code=201)
def create_order(payload: schemas.OrderCreate, db: Session = Depends(get_db)):
	items = [(item.product_id, item.quantity) for item in payload.items]
	try:
		return crud.create_order(db, customer_id=payload.customer_id, items=items)
	except ValueError as exc:
		raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/", response_model=list[schemas.OrderOut])
def list_orders(skip: int = Query(0, ge=0), limit: int = Query(50, ge=1, le=200), db: Session = Depends(get_db)):
	return crud.list_orders(db, skip=skip, limit=limit)


@router.get("/{order_id}", response_model=schemas.OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db)):
	order = crud.get_order(db, order_id)
	if not order:
		raise HTTPException(status_code=404, detail="Order not found")
	return order


@router.patch("/{order_id}/status", response_model=schemas.OrderOut)
def update_status(order_id: int, payload: schemas.OrderUpdateStatus, db: Session = Depends(get_db)):
	order = crud.get_order(db, order_id)
	if not order:
		raise HTTPException(status_code=404, detail="Order not found")
	return crud.update_order_status(db, order, payload.status)


@router.post("/{order_id}/cancel", response_model=schemas.OrderOut)
def cancel(order_id: int, db: Session = Depends(get_db)):
	order = crud.get_order(db, order_id)
	if not order:
		raise HTTPException(status_code=404, detail="Order not found")
	return crud.cancel_order(db, order)
