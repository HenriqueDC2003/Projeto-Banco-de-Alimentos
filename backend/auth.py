from datetime import datetime, timedelta
from typing import Optional
import os
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from models import Usuario
from database import get_db

# Configurações
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 8

# Contexto de criptografia de senhas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Esquema OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def hash_senha(senha: str) -> str:
    """Hash de uma senha com bcrypt."""
    return pwd_context.hash(senha)


def verificar_senha(senha: str, senha_hash: str) -> bool:
    """Verifica se a senha corresponde ao hash."""
    return pwd_context.verify(senha, senha_hash)


def criar_token_jwt(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Cria um token JWT."""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verificar_token(token: str) -> dict:
    """Verifica e decodifica um token JWT."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        usuario_id: str = payload.get("sub")
        if usuario_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_usuario_atual(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Usuario:
    """Dependency para obter o usuário atual autenticado."""
    payload = verificar_token(token)
    usuario_id = payload.get("sub")
    
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado",
        )
    return usuario


def exigir_admin(usuario: Usuario = Depends(get_usuario_atual)) -> Usuario:
    """Dependency para verificar se o usuário é admin."""
    if usuario.nivel != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a administradores",
        )
    return usuario
