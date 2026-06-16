from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
import uuid

from database import get_db
from models import Usuario
from auth import (
    hash_senha,
    verificar_senha,
    criar_token_jwt,
    get_usuario_atual,
)

router = APIRouter(prefix="/auth", tags=["Autenticação"])


# ── Schemas ────────────────────────────────────────────────────────────────────

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    usuario: dict

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


class AlterarSenhaBody(BaseModel):
    """
    Body para POST /auth/alterar-senha.
    Anteriormente recebia como query params — corrigido para JSON body.
    """
    senha_atual: str
    senha_nova: str


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.post("/login", response_model=LoginResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """
    Login com e-mail e senha (OAuth2 form: username=email, password=senha).
    Retorna JWT + dados do usuário.
    """
    usuario = db.query(Usuario).filter(
        Usuario.email == form_data.username.lower().strip()
    ).first()

    if not usuario or not verificar_senha(form_data.password, usuario.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha inválidos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = criar_token_jwt({"sub": str(usuario.id)})

    return {
        "access_token": token,
        "token_type": "bearer",
        "usuario": {
            "id": str(usuario.id),
            "nome": usuario.nome,
            "sobrenome": usuario.sobrenome,
            "email": usuario.email,
            "nivel": usuario.nivel,
        },
    }


@router.post("/alterar-senha")
def alterar_senha(
    body: AlterarSenhaBody,                         # ← body JSON, não query params
    usuario: Usuario = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
):
    """
    Altera a senha do usuário logado.
    Requer autenticação via Bearer token.

    Body JSON:
        { "senha_atual": "...", "senha_nova": "..." }
    """
    if not verificar_senha(body.senha_atual, usuario.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Senha atual inválida",
        )

    if len(body.senha_nova) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A nova senha deve ter pelo menos 6 caracteres",
        )

    usuario.senha_hash = hash_senha(body.senha_nova)
    db.commit()

    return {"mensagem": "Senha alterada com sucesso"}


@router.get("/me", response_model=UsuarioOut)
def obter_usuario_atual(usuario: Usuario = Depends(get_usuario_atual)):
    """Retorna os dados do usuário autenticado."""
    return usuario
