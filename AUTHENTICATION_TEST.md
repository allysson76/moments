# Testes da API de Autenticação

# 1. CADASTRAR NOVO USUÁRIO
curl -X POST http://localhost:3000/auth/cadastrar \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@example.com",
    "senha": "SenhaForte123!"
  }'

# Resposta esperada:
# {
#   "mensagem": "Usuário cadastrado com sucesso",
#   "usuario": { "id": "...", "nome": "João Silva", "email": "joao@example.com" },
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
# }

# 2. FAZER LOGIN
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "senha": "SenhaForte123!"
  }'

# Resposta: (guarde o token!)
# {
#   "mensagem": "Login realizado com sucesso",
#   "usuario": { "id": "...", "nome": "João Silva", "email": "joao@example.com" },
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
# }

# 3. OBTER PERFIL (ROTA PROTEGIDA)
# Substitua SEU_TOKEN_AQUI pelo token recebido no login
curl -X GET http://localhost:3000/auth/perfil \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

# Resposta:
# {
#   "id": "...",
#   "nome": "João Silva",
#   "email": "joao@example.com",
#   "criado_em": "2024-01-01T00:00:00.000Z",
#   "email_verificado": false
# }

# 4. LISTAR POSTS DO USUÁRIO (ROTA PROTEGIDA)
curl -X GET http://localhost:3000/posts \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

# 5. UPLOAD DE IMAGEM (ROTA PROTEGIDA)
curl -X POST http://localhost:3000/upload \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -F "image=@/caminho/para/sua/imagem.jpg"

# 6. SOLICITAR RECUPERAÇÃO DE SENHA
curl -X POST http://localhost:3000/auth/recuperar-senha \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com"
  }'

# Resposta:
# {
#   "mensagem": "Se o email estiver cadastrado, você receberá instruções para recuperação",
#   "dev_token": "abc123..." (apenas em desenvolvimento)
# }

# 7. RESETAR SENHA COM TOKEN
curl -X POST http://localhost:3000/auth/resetar-senha \
  -H "Content-Type: application/json" \
  -d '{
    "token": "TOKEN_RECEBIDO_POR_EMAIL",
    "novaSenha": "NovaSenhaForte456!"
  }'

# 8. ALTERAR SENHA (USUÁRIO LOGADO)
curl -X PUT http://localhost:3000/auth/alterar-senha \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "senhaAtual": "SenhaForte123!",
    "novaSenha": "NovaSenhaForte456!"
  }'

# TESTE DE ERRO: Tentar acessar rota protegida sem token
curl -X GET http://localhost:3000/posts

# Resposta esperada:
# {
#   "erro": "Token de autenticação não fornecido",
#   "codigo": "TOKEN_AUSENTE"
# }

# TESTE DE ERRO: Token inválido
curl -X GET http://localhost:3000/posts \
  -H "Authorization: Bearer token_invalido_123"

# Resposta esperada:
# {
#   "erro": "Token inválido",
#   "codigo": "TOKEN_INVALIDO"
# }