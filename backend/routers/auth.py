import os
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from jose import jwt, JWTError
from passlib.context import CryptContext

from database import get_db
from models import Usuario

# 1. Configurações simplificadas (com valor padrão para não quebrar a API)
SECRET_KEY = os.getenv("SECRET_KEY", "chave_super_secreta_banco_alimentos")
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter(prefix="/auth", tags=["Autenticação"])

# 2. Schemas básicos
class LoginRequest(BaseModel):
    email: str
    senha: str

# 3. Funções de apoio
def hash_senha(senha: str) -> str:
    return pwd_context.hash(senha)

def verificar_senha(senha_plana: str, senha_hash: str) -> bool:
    return pwd_context.verify(senha_plana, senha_hash)

# 4. Dependência para proteger as rotas
def get_usuario_atual(authorization: str = Header(None), db: Session = Depends(get_db)) -> Usuario:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token ausente ou mal formatado")
    
    token = authorization.replace("Bearer ", "")
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        usuario_id = payload.get("id")
        if not usuario_id:
            raise ValueError()
    except (JWTError, ValueError):
        raise HTTPException(status_code=401, detail="Token inválido")

    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=401, detail="Usuário não encontrado")
        
    return usuario

# 5. Endpoints
@router.post("/login")
def login(dados: LoginRequest, db: Session = Depends(get_db)):
    # Busca o usuário pelo email enviado no JSON
    usuario = db.query(Usuario).filter(Usuario.email == dados.email.lower().strip()).first()

    # Verifica a senha
    if not usuario or not verificar_senha(dados.senha, usuario.senha_hash):
        raise HTTPException(status_code=401, detail="E-mail ou senha inválidos")

    # Gera um token simples que não expira (adequado para 3 usuários fixos)
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