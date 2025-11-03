# Instabytes API

Este projeto é um servidor Node.js utilizando Express, MongoDB e Multer para upload de imagens. Ele permite a criação, listagem e atualização de posts com suporte a imagens.

&nbsp;
## 🚀 Funcionalidades
&nbsp;
- Upload de imagens usando Multer
- Geração de descrição automática com Gemini 1.5 Flash (Google)
- Armazenamento de postagens no MongoDB
- Renomeação de imagens com o `ObjectId` do MongoDB
- Criação, listagem e atualização de posts
- Servidor estático para exibir imagens
- Alt-text personalizado opcional via PUT

&nbsp;

## 📦 Tecnologias Utilizadas
&nbsp;
- Node.js
- Express
- MongoDB + MongoDB Atlas
- Multer
- dotenv
- Google Generative AI SDK
- CORS

&nbsp;

## ⚙️ Instalação e Execução
&nbsp;
1. Clone o repositório:

```bash
git clone git@github.com:AllyssonLPereira/API_node.git
cd local-armazenamento
```

2. Instale as dependências:
```bash
npm install
```

3. Crie o arquivo `.env`:

```bash
GEMINI_API_KEY=sua-chave-do-gemini
STRING_CONECTION=sua-string-de-conexao-do-mongodb
```

4. Inicie o servidor:
```bash
node server.js
```
&nbsp;

### Rotas da API

Método  | Endpoint      | Descrição
------- | ------------- | -----------------------
GET	  | /posts	      | Lista todas as postagens
POST	  | /posts	      | Cria um post simples (sem imagem)
POST	  | /upload	      | Faz upload de imagem e cria um post vazio
PUT	  | /upload/:id	| Gera descrição com IA e atualiza o post
