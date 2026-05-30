from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from models import Distribuicao, Lote
from pydantic import BaseModel
from datetime import date
import uuid

router = APIRouter()


class DistribuicaoSchema(BaseModel):
    id_lote: uuid.UUID
    id_entidade: uuid.UUID
    id_usuario: uuid.UUID
    quantidade: float
    data: date

    class Config:
        from_attributes = True


@router.get("/distribuicoes")
def listar(db: Session = Depends(get_db)):
    return db.query(Distribuicao).all()


@router.get("/distribuicoes/resumo-mensal")
def resumo_mensal(ano: int, mes: int, db: Session = Depends(get_db)):
    resultado = db.execute(
        text("""
        SELECT 
            a.nome as alimento,
            SUM(d.quantidade) as total_distribuido,
            COUNT(d.id) as num_distribuicoes
        FROM distribuicoes d
        JOIN lotes l ON l.id = d.id_lote
        JOIN alimentos a ON a.id = l.id_alimento
        WHERE EXTRACT(YEAR FROM d.data) = :ano
          AND EXTRACT(MONTH FROM d.data) = :mes
        GROUP BY a.nome
        ORDER BY total_distribuido DESC
    """),
        {"ano": ano, "mes": mes},
    )
    return [dict(r._mapping) for r in resultado]


@router.post("/distribuicoes")
def criar(data: DistribuicaoSchema, db: Session = Depends(get_db)):
    lote = db.query(Lote).filter(Lote.id == data.id_lote).first()
    if not lote:
        raise HTTPException(404, "Lote não encontrado")
    if lote.quantidade < data.quantidade:
        raise HTTPException(
            400, f"Quantidade insuficiente no lote (disponível: {lote.quantidade})"
        )
    dist = Distribuicao(**data.model_dump())
    lote.quantidade -= data.quantidade
    db.add(dist)
    db.commit()
    db.refresh(dist)
    return dist
