# 🔐 Guia de Configuração do MongoDB com Senha Especial

## Problema

Sua senha do MongoDB contém caracteres especiais que não são permitidos diretamente na connection string:

```
: / ? # [ ] @ ! $ & ' ( ) * + , ; = %
```

## Solução: URL Encoding (Percent-Encoding)

---

## 📋 Método 1: Usando o Script Helper (RECOMENDADO)

### Passo 1: Execute o script

```bash
node src/scripts/encodePassword.js "SuaSenha@Aqui#123"
```

### Passo 2: Copie a senha encodada

O script irá mostrar algo assim:

```
======================================================================
📊 RESULTADO DO ENCODING
======================================================================

🔓 Senha Original:  SuaSenha@Aqui#123
🔒 Senha Encodada:  SuaSenha%40Aqui%23123

📝 Caracteres Especiais Encodados:
   @ → %40
   # → %23
```

### Passo 3: Atualize o .env

```env
STRING_CONECTION=mongodb+srv://usuario:SuaSenha%40Aqui%23123@cluster0.xxxxx.mongodb.net/moments_db
```

---

## 📋 Método 2: Encoding Manual Online

### Passo 1: Acesse uma ferramenta online

- https://www.urlencoder.org/
- https://meyerweb.com/eric/tools/dencoder/

### Passo 2: Cole sua senha e copie o resultado

### Passo 3: Use na connection string

```env
STRING_CONECTION=mongodb+srv://usuario:SENHA_ENCODADA@cluster.mongodb.net/database
```

---

## 📋 Método 3: Usando Node.js Diretamente

### No terminal, execute:

```bash
node -e "console.log(encodeURIComponent('SuaSenha@Aqui#123'))"
```

### Resultado:

```
SuaSenha%40Aqui%23123
```

---

## 📋 Método 4: Componentes Separados (Encoding Automático)

Se preferir, você pode usar componentes separados no .env e o sistema fará o encoding automaticamente:

```env
MONGO_USERNAME=seu_usuario
MONGO_PASSWORD=SuaSenha@Aqui#123
MONGO_CLUSTER=cluster0.xxxxx.mongodb.net
MONGO_DATABASE=moments_db
```

O sistema irá construir a connection string com encoding automático.

---

## 🔍 Tabela de Referência de Encoding

| Caractere | Encoding | Caractere | Encoding |
|-----------|----------|-----------|----------|
| `:`       | `%3A`    | `@`       | `%40`    |
| `/`       | `%2F`    | `[`       | `%5B`    |
| `?`       | `%3F`    | `]`       | `%5D`    |
| `#`       | `%23`    | `%`       | `%25`    |
| `!`       | `%21`    | `+`       | `%2B`    |
| `$`       | `%24`    | `,`       | `%2C`    |
| `&`       | `%26`    | `;`       | `%3B`    |
| `'`       | `%27`    | `=`       | `%3D`    |
| `(`       | `%28`    | `*`       | `%2A`    |
| `)`       | `%29`    | (espaço)  | `%20`    |

---

## ✅ Exemplos Completos

### Exemplo 1: Senha Simples

**Senha Original:** `MyP@ssw0rd!`

**Senha Encodada:** `MyP%40ssw0rd%21`

**Connection String:**
```
mongodb+srv://admin:MyP%40ssw0rd%21@cluster0.abc123.mongodb.net/moments_db
```

### Exemplo 2: Senha Complexa

**Senha Original:** `Tr0c@r#S3nh@!2024`

**Senha Encodada:** `Tr0c%40r%23S3nh%40%212024`

**Connection String:**
```
mongodb+srv://user123:Tr0c%40r%23S3nh%40%212024@cluster0.abc123.mongodb.net/moments_db
```

### Exemplo 3: Senha com Muitos Caracteres Especiais

**Senha Original:** `P@ss:w/rd?[2024]!`

**Senha Encodada:** `P%40ss%3Aw%2Frd%3F%5B2024%5D%21`

**Connection String:**
```
mongodb+srv://moments_user:P%40ss%3Aw%2Frd%3F%5B2024%5D%21@cluster0.abc123.mongodb.net/moments_db
```

---

## 🧪 Testando a Conexão

Depois de configurar o .env, teste a conexão:

```bash
npm run dev
```

### Sucesso ✅

```
🔄 Conectando ao MongoDB Atlas...
✅ Conectado ao MongoDB Atlas com sucesso!
🏓 Ping ao banco de dados bem-sucedido!
🚀 Servidor Moments rodando na porta 3000
```

### Erro de Autenticação ❌

```
❌ Falha na conexão com o banco!
Detalhes: Authentication failed

💡 DICA: Problema de autenticação detectado!
   Possíveis causas:
   1. Senha incorreta
   2. Senha contém caracteres especiais não encodados
   3. Usuário não tem permissões corretas
```

**Solução:** Re-encode a senha usando o script helper.

---

## 🔒 Boas Práticas de Segurança

1. **Nunca commitar o .env** - Já está no .gitignore
2. **Use senhas fortes** - Mínimo 12 caracteres com números, letras e símbolos
3. **Rotacione senhas regularmente** - Troque a cada 90 dias
4. **Use variáveis de ambiente em produção** - Nunca hardcode credenciais
5. **Habilite 2FA no MongoDB Atlas** - Camada extra de segurança
6. **Whitelist apenas IPs necessários** - Não use 0.0.0.0/0 em produção
7. **Use princípio do menor privilégio** - Dê apenas permissões necessárias ao usuário

---

## 🆘 Troubleshooting

### Erro: "bad auth: Authentication failed"

**Causa:** Senha incorreta ou mal encodada

**Solução:**
1. Verifique se copiou a senha encodada corretamente
2. Re-execute o script de encoding
3. Verifique se não há espaços extras na connection string

### Erro: "ENOTFOUND"

**Causa:** Cluster não encontrado ou nome incorreto

**Solução:**
1. Verifique o nome do cluster no MongoDB Atlas
2. Certifique-se que o cluster está ativo
3. Verifique sua conexão com internet

### Erro: "connection attempt failed"

**Causa:** IP não está na whitelist

**Solução:**
1. Acesse MongoDB Atlas → Network Access
2. Adicione seu IP ou use 0.0.0.0/0 (apenas desenvolvimento)

---

## 📚 Referências

- [MongoDB Atlas - Special Characters in Password](https://www.mongodb.com/pt-br/docs/atlas/troubleshoot-connection/#special-characters-in-connection-string-password)
- [URL Encoding (MDN)](https://developer.mozilla.org/en-US/docs/Glossary/percent-encoding)
- [MongoDB Connection String Format](https://www.mongodb.com/docs/manual/reference/connection-string/)