from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from database import engine
from routers import alimentos, lotes, distribuicoes, auxiliares, auth, usuarios

app = FastAPI(title="Banco de Alimentos API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, tags=["Autenticação"])
app.include_router(usuarios.router, tags=["Usuários"])
app.include_router(alimentos.router, tags=["Alimentos"])
app.include_router(lotes.router, tags=["Lotes"])
app.include_router(distribuicoes.router, tags=["Distribuições"])
app.include_router(auxiliares.router, tags=["Auxiliares"])


@app.get("/")
def root():
    return {"status": "ok"}


@app.get("/health")
def health():
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    return {"status": "ok", "database": "conectado"}
