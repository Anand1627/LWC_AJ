from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings


class Base(DeclarativeBase):
	pass


def _create_engine():
	connect_args = {}
	if settings.database_url.startswith("sqlite"):
		connect_args = {"check_same_thread": False}
	return create_engine(
		settings.database_url,
		echo=False,
		future=True,
		connect_args=connect_args,
	)


engine = _create_engine()
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


def get_db() -> Generator:
	session = SessionLocal()
	try:
		yield session
	finally:
		session.close()
