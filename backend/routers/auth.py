from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
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


@router.post("/login", response_model=LoginResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Login com e-mail e senha.
    Retorna JWT token e dados do usuário.
    """
    # O formulário OAuth2 usa 'username' mas vamos usar como email
    usuario = db.query(Usuario).filter(Usuario.email == form_data.username).first()
    
    if not usuario or not verificar_senha(form_data.password, usuario.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha inválidos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Criar token JWT
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
        }
    }


@router.post("/alterar-senha")
def alterar_senha(
    senha_atual: str,
    senha_nova: str,
    usuario: Usuario = Depends(get_usuario_atual),
    db: Session = Depends(get_db)
):
    """
    Altera a própria senha do usuário logado.
    """
    if not verificar_senha(senha_atual, usuario.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Senha atual inválida",
        )
    
    usuario.senha_hash = hash_senha(senha_nova)
    db.commit()
    
    return {"mensagem": "Senha alterada com sucesso"}


@router.get("/me", response_model=UsuarioOut)
def obter_usuario_atual(usuario: Usuario = Depends(get_usuario_atual)):
    """
    Retorna os dados do usuário atualmente logado.
    """
    return usuario
