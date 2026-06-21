from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from jose import jwt

from database import get_db
from models import Usuario
from security import verificar_senha, get_usuario_atual, SECRET_KEY, ALGORITHM

router = APIRouter(prefix="/auth", tags=["Autenticação"])

class LoginRequest(BaseModel):
    email: str
    senha: str

@router.post("/login")
def login(dados: LoginRequest, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == dados.email.lower().strip()).first()

    if not usuario or not verificar_senha(dados.senha, usuario.senha_hash):
        raise HTTPException(status_code=401, detail="E-mail ou senha inválidos")

    # Gera o token simples
    token = jwt.encode({"id": str(usuario.id)}, SECRET_KEY, algorithm=ALGORITHM)

    return {
        "access_token": token,
        "usuario": {
            "id": str(usuario.id),
            "nome": usuario.nome,
            "email": usuario.email,
            "nivel": usuario.nivel
        }
    }

@router.get("/me")
def obter_usuario_atual_rota(usuario: Usuario = Depends(get_usuario_atual)):
    return {
        "id": str(usuario.id),
        "nome": usuario.nome,
        "email": usuario.email,
        "nivel": usuario.nivel
    }