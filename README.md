
🛠️ Como Executar o Projeto
Certifique-se de ter o Docker e o Docker Compose instalados na sua máquina.

Clone este repositório.

Certifique-se de ter configurado o arquivo .env corretamente.

No terminal, execute o comando abaixo para construir e iniciar os containers em segundo plano:

Bash
docker compose up -d --build
A API estará rodando e pronta para receber conexões na porta 8080.

🔐 Autenticação e Integração com Frontend
Ao rodar os containers pela primeira vez, o sistema cria automaticamente o usuário administrador usando os dados definidos no .env.

A API utiliza um fluxo de autenticação via JSON simples. Para conectar um frontend, siga os passos:

1. Login (Gerar Token)
Faça uma requisição POST para a rota /auth/login enviando o corpo em JSON:

JSON
{
  "email": "admin@bancoalimentos.local",
  "senha": "Admin@123"
}
2. Acesso às Rotas Protegidas
O backend retornará um access_token em caso de sucesso. Para consumir outras rotas do sistema (como /alimentos), o frontend deve injetar esse token no cabeçalho das requisições:

HTTP
Authorization: Bearer <SEU_TOKEN_AQUI>
📚 Documentação da API
O FastAPI gera automaticamente a documentação interativa das rotas disponíveis. Com o projeto em execução, acesse no navegador:

Swagger UI: http://localhost:8080/docs

ReDoc: http://localhost:8080/redoc