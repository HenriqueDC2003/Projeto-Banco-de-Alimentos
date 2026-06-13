from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
import uuid

from database import get_db
from models import Usuario
from auth import hash_senha, get_usuario_atual, exigir_admin

router = APIRouter(prefix="/usuarios", tags=["Usuários"])


class UsuarioCreate(BaseModel):
    nome: str
    sobrenome: str
    email: str
    senha: str
    nivel: str = "operador"

    class Config:
        from_attributes = True


class UsuarioOut(BaseModel):
    id: uuid.UUID
    nome: str
    sobrenome: str
    email: str
    nivel: str

    class Config:
        from_attributes = True


@router.get("/", response_model=List[UsuarioOut])
def listar_usuarios(
    admin: Usuario = Depends(exigir_admin),
    db: Session = Depends(get_db)
):
    """
    Lista todos os usuários. Apenas admin pode acessar.
    """
    usuarios = db.query(Usuario).all()
    return usuarios


@router.post("/", response_model=UsuarioOut)
def criar_usuario(
    usuario_data: UsuarioCreate,
    admin: Usuario = Depends(exigir_admin),
    db: Session = Depends(get_db)
):
    """
    Cria um novo usuário. Apenas admin pode criar.
    """
    # Verificar se e-mail já existe
    usuario_existente = db.query(Usuario).filter(Usuario.email == usuario_data.email).first()
    if usuario_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="E-mail já registrado",
        )
    
    # Validar nível
    if usuario_data.nivel not in ["admin", "operador"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nível deve ser 'admin' ou 'operador'",
        )
    
    # Criar novo usuário
    novo_usuario = Usuario(
        nome=usuario_data.nome,
        sobrenome=usuario_data.sobrenome,
        email=usuario_data.email,
        senha_hash=hash_senha(usuario_data.senha),
        nivel=usuario_data.nivel,
    )
    
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    
    return novo_usuario


@router.delete("/{usuario_id}")
def deletar_usuario(
    usuario_id: uuid.UUID,
    admin: Usuario = Depends(exigir_admin),
    db: Session = Depends(get_db)
):
    """
    Deleta um usuário. Apenas admin pode deletar.
    """
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado",
        )
    
    if usuario.id == admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Você não pode deletar sua própria conta",
        )
    
    db.delete(usuario)
    db.commit()
    
    return {"mensagem": "Usuário deletado com sucesso"}
