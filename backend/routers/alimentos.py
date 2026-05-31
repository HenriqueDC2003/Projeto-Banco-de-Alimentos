from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Alimento
from pydantic import BaseModel
from typing import Optional
import uuid

router = APIRouter()


class AlimentoSchema(BaseModel):
    nome: str
    id_tipo: Optional[uuid.UUID] = None
    id_marca: Optional[uuid.UUID] = None
    id_unidade: Optional[uuid.UUID] = None
    descricao: Optional[str] = None

    class Config:
        from_attributes = True


@router.get("/alimentos")
def listar(db: Session = Depends(get_db)):
    return db.query(Alimento).all()


@router.get("/alimentos/{id}")
def buscar(id: uuid.UUID, db: Session = Depends(get_db)):
    a = db.query(Alimento).filter(Alimento.id == id).first()
    if not a:
        raise HTTPException(404, "Alimento não encontrado")
    return a


@router.post("/alimentos")
def criar(data: AlimentoSchema, db: Session = Depends(get_db)):
    alimento = Alimento(**data.model_dump())
    db.add(alimento)
    db.commit()
    db.refresh(alimento)
    return alimento


@router.put("/alimentos/{id}")
def atualizar(id: uuid.UUID, data: AlimentoSchema, db: Session = Depends(get_db)):
    a = db.query(Alimento).filter(Alimento.id == id).first()
    if not a:
        raise HTTPException(404, "Alimento não encontrado")
    for k, v in data.model_dump().items():
        setattr(a, k, v)
    db.commit()
    db.refresh(a)
    return a


@router.delete("/alimentos/{id}")
def deletar(id: uuid.UUID, db: Session = Depends(get_db)):
    a = db.query(Alimento).filter(Alimento.id == id).first()
    if not a:
        raise HTTPException(404, "Alimento não encontrado")
    db.delete(a)
    db.commit()
    return {"ok": True}
