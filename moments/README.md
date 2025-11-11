
# 📸 Moments

> Um cofre digital de memórias - Seu repositório pessoal, seguro e inteligente para fotos e vídeos.

![Node.js](https://img.shields.io/badge/Node.js-14+-green.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-brightgreen.svg)
![License](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)

## 🎯 Sobre o Projeto

O **Moments** é uma plataforma de armazenamento pessoal de mídias que resolve o problema da fragmentação de fotos e vídeos em múltiplos dispositivos. Diferente de redes sociais, o Moments é um cofre digital 100% privado, focado exclusivamente em preservar e organizar suas memórias.

### 💡 Diferenciais

- **100% Privado**: Não é rede social. Suas fotos são só suas.
- **Busca Inteligente**: IA para reconhecimento de conteúdo e tags automáticas
- **Multi-plataforma**: Web e Mobile (iOS/Android)
- **Organização por Álbuns**: Crie "Moments" temáticos para suas fotos
- **Upload em Massa**: Envie centenas de fotos de uma vez
- **Segurança Máxima**: Criptografia em trânsito e em repouso

## 🚀 Tecnologias

### Backend
- **Node.js** (v14+) com ES Modules
- **Express.js** - Framework web
- **MongoDB** - Banco de dados NoSQL
- **JWT** - Autenticação segura
- **Bcrypt** - Hash de senhas
- **Multer** - Upload de arquivos
- **Google Gemini AI** - Reconhecimento de imagens

### Segurança
- HTTPS obrigatório em produção
- Tokens JWT com expiração
- Senhas com hash bcrypt (10 rounds)
- Validação de entrada em todas as rotas
- Isolamento total de dados por usuário

## 📋 Pré-requisitos

- Node.js >= 14.0.0
- npm >= 6.0.0
- MongoDB Atlas (ou local)
- Google Gemini API Key

## 🔧 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/moments.git
cd moments
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# MongoDB
STRING_CONECTION=mongodb+srv://usuario:senha@cluster.mongodb.net/moments_db
DB_NAME=moments_db
# JWT
JWT_SECRET=sua-chave-secreta-super-segura

# Gemini AI
GEMINI_API_KEY=sua-api-key-do-gemini

# Servidor
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:8000
```

> ⚠️ **Importante**: Se sua senha do MongoDB contém caracteres especiais, use o script de encoding:
> ```bash
> node src/scripts/encodePassword.js "SuaSenha@123"
> ```

### 4. Inicie o servidor

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm start
```

O servidor estará rodando em `http://localhost:3000`

## 📚 Estrutura do Projeto

```
moments/
├── src/
│   ├── config/          # Configurações
│   │   ├── authConfig.js
│   │   └── dbConfig.js
│   ├── controllers/     # Lógica de negócio
│   │   ├── authController.js
│   │   └── mediaController.js
│   ├── middleware/      # Middlewares
│   │   └── authMiddleware.js
│   ├── models/          # Modelos de dados
│   │   ├── userModel.js
│   │   └── mediaModel.js
│   ├── routes/          # Rotas da API
│   │   ├── authRoute.js
│   │   └── mediaRoute.js
│   ├── services/        # Serviços externos
│   │   └── geminiService.js
│   ├── scripts/         # Scripts utilitários
│   │   └── encodePassword.js
│   └── utils/           # Funções auxiliares
│       ├── validators.js
│       └── mongoUtils.js
├── uploads/             # Arquivos de mídia
├── server.js            # Ponto de entrada
├── package.json
└── .env                 # Variáveis de ambiente (não comitar!)
```

## 🔐 API Endpoints

### Autenticação

#### Cadastrar Usuário
```http
POST /auth/cadastrar
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao@example.com",
  "senha": "SenhaForte123!"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "joao@example.com",
  "senha": "SenhaForte123!"
}
```

#### Obter Perfil
```http
GET /auth/perfil
Authorization: Bearer {token}
```

#### Recuperar Senha
```http
POST /auth/recuperar-senha
Content-Type: application/json

{
  "email": "joao@example.com"
}
```

### Mídias

#### Listar Biblioteca
```http
GET /media?pagina=1&limite=50&tipo=image
Authorization: Bearer {token}
```

#### Upload de Foto/Vídeo
```http
POST /media/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [arquivo]
```

#### Buscar por Tags (IA)
```http
GET /media/search?q=praia,cachorro
Authorization: Bearer {token}
```

#### Obter Mídia Específica
```http
GET /media/:id
Authorization: Bearer {token}
```

#### Deletar Mídia
```http
DELETE /media/:id
Authorization: Bearer {token}
```

## 🧪 Testando a API

### Com cURL

```bash
# 1. Cadastrar
curl -X POST http://localhost:3000/auth/cadastrar \
  -H "Content-Type: application/json" \
  -d '{"nome":"João","email":"joao@teste.com","senha":"Teste123!"}'

# 2. Login (copie o token da resposta)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@teste.com","senha":"Teste123!"}'

# 3. Upload de foto
curl -X POST http://localhost:3000/media/upload \
  -H "Authorization: Bearer SEU_TOKEN" \
  -F "file=@/caminho/foto.jpg"

# 4. Listar fotos
curl -X GET http://localhost:3000/media \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Com Insomnia/Postman

Importe a coleção de testes disponível em `/docs/api-collection.json`

## 🏗️ Arquitetura

### Fluxo de Dados

```
Cliente → Express → Middleware Auth → Controller → Model → MongoDB
                                          ↓
                                     Gemini AI (para imagens)
```

### Segurança em Camadas

1. **HTTPS**: Criptografia em trânsito
2. **JWT**: Autenticação stateless
3. **Bcrypt**: Hash de senhas
4. **Middleware**: Validação de tokens
5. **Isolamento**: Filtro por userId em todas as queries
6. **Validação**: Sanitização de inputs

### Banco de Dados

#### Coleção `usuarios`
```javascript
{
  _id: ObjectId,
  nome: String,
  email: String,
  senha_hash: String,
  criado_em: Date,
  email_verificado: Boolean
}
```

#### Coleção `media`
```javascript
{
  _id: ObjectId,
  userId: String,
  storageKey: String,
  filename: String,
  mediaType: "image" | "video",
  fileSizeBytes: Number,
  createdAt: Date,
  metadata: Object,
  aiTags: [String]
}
```

## 🤖 Integração com IA

O Moments usa o Google Gemini para:
- Gerar descrições automáticas de imagens
- Extrair tags para busca inteligente
- Criar alt-text acessível

A IA processa as imagens **assincronamente** após o upload, não bloqueando a resposta.

## 🔒 Segurança

### Requisitos de Senha
- Mínimo 8 caracteres
- Pelo menos uma letra maiúscula
- Pelo menos uma letra minúscula
- Pelo menos um número
- Pelo menos um caractere especial

### Boas Práticas Implementadas
- ✅ Senhas hasheadas com bcrypt
- ✅ Tokens JWT com expiração
- ✅ Validação de entrada em todas as rotas
- ✅ Sanitização de dados
- ✅ Isolamento de dados por usuário
- ✅ CORS configurado
- ✅ Rate limiting (planejado)
- ✅ Logs de segurança

## 📈 Roadmap

### MVP (Em Desenvolvimento)
- [x] Autenticação segura
- [x] Upload de mídias
- [x] Busca inteligente com IA
- [x] Biblioteca unificada
- [ ] Álbuns (Moments)
- [ ] App móvel (React Native)

### Futuras Funcionalidades
- [ ] Sincronização automática mobile
- [ ] Backup incremental
- [ ] Reconhecimento facial
- [ ] Timeline por localização
- [ ] Exportação de álbuns
- [ ] Compartilhamento temporário

## 🤝 Contribuindo

Contribuições são bem-vindas! Siga estas etapas:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 👥 Equipe

- **João Victor Lourenço Teixeira** - Líder de Desenvolvimento
- **Allysson Lunguinho Pereira** - Dono do Negócio
- **Gabriella Dinair de Sousa Lopes** - Desenvolvedora
- **Clayton Rocha de Barros Júnior** - Desenvolvedor
- **João Marcelo Lima de Aguiar** - Desenvolvedor

## 📄 Licença

Este projeto está sob a licença AGPL-3.0. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

- **Documentação**: `/docs`
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/moments/issues)
- **Email**: suporte@moments.app

---

<p align="center">
  Feito com ❤️ pelo time Moments
</p>