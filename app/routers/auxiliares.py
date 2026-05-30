from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Tipo, Marca, Unidade, Parceiro
from pydantic import BaseModel
from typing import Optional
import uuid

router = APIRouter()


class TipoSchema(BaseModel):
    nome: str
    descricao: Optional[str] = None

    class Config:
        from_attributes = True


class ParceiroSchema(BaseModel):
    nome: str
    tipo: Optional[str] = None
    contato: Optional[str] = None
    descricao: Optional[str] = None

    class Config:
        from_attributes = True


@router.get("/tipos")
def listar_tipos(db: Session = Depends(get_db)):
    return db.query(Tipo).all()


@router.post("/tipos")
def criar_tipo(data: TipoSchema, db: Session = Depends(get_db)):
    tipo = Tipo(**data.model_dump())
    db.add(tipo)
    db.commit()
    db.refresh(tipo)
    return tipo


@router.get("/marcas")
def listar_marcas(db: Session = Depends(get_db)):
    return db.query(Marca).all()


@router.post("/marcas")
def criar_marca(nome: str, db: Session = Depends(get_db)):
    marca = Marca(nome=nome)
    db.add(marca)
    db.commit()
    db.refresh(marca)
    return marca


@router.get("/unidades")
def listar_unidades(db: Session = Depends(get_db)):
    return db.query(Unidade).all()


@router.post("/unidades")
def criar_unidade(nome: str, db: Session = Depends(get_db)):
    unidade = Unidade(nome=nome)
    db.add(unidade)
    db.commit()
    db.refresh(unidade)
    return unidade


@router.get("/parceiros")
def listar_parceiros(db: Session = Depends(get_db)):
    return db.query(Parceiro).all()


@router.post("/parceiros")
def criar_parceiro(data: ParceiroSchema, db: Session = Depends(get_db)):
    parceiro = Parceiro(**data.model_dump())
    db.add(parceiro)
    db.commit()
    db.refresh(parceiro)
    return parceiro
