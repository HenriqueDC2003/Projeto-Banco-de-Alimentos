from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from models import Lote
from pydantic import BaseModel
from typing import Optional
from datetime import date
import uuid

router = APIRouter()


class LoteSchema(BaseModel):
    id_alimento: uuid.UUID
    id_parceiro: Optional[uuid.UUID] = None
    id_ponto_coleta: Optional[uuid.UUID] = None
    quantidade: float
    data_chegada: date
    data_validade: Optional[date] = None
    foi_comprado: bool = False
    preco: Optional[float] = None
    esta_estragado: bool = False

    class Config:
        from_attributes = True


@router.get("/lotes")
def listar(db: Session = Depends(get_db)):
    return db.query(Lote).all()


@router.get("/lotes/vencendo")
def vencendo_em_breve(dias: int = 30, db: Session = Depends(get_db)):
    resultado = db.execute(
        text("""
        SELECT l.id, a.nome as alimento, l.quantidade, l.data_validade,
               l.data_validade - CURRENT_DATE as dias_restantes
        FROM lotes l
        JOIN alimentos a ON a.id = l.id_alimento
        WHERE l.data_validade IS NOT NULL
          AND l.data_validade <= CURRENT_DATE + :dias
          AND l.esta_estragado = false
        ORDER BY l.data_validade ASC
    """),
        {"dias": dias},
    )
    return [dict(r._mapping) for r in resultado]


@router.post("/lotes")
def criar(data: LoteSchema, db: Session = Depends(get_db)):
    lote = Lote(**data.model_dump())
    db.add(lote)
    db.commit()
    db.refresh(lote)
    return lote


@router.patch("/lotes/{id}/estragado")
def marcar_estragado(id: uuid.UUID, db: Session = Depends(get_db)):
    l = db.query(Lote).filter(Lote.id == id).first()
    if not l:
        raise HTTPException(404, "Lote não encontrado")
    l.esta_estragado = True
    db.commit()
    db.refresh(l)
    return l
