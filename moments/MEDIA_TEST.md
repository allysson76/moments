# Testes da API de Mídia

## 1. UPLOAD DE FOTO
```bash
curl -X POST http://localhost:3000/media/upload \
  -H "Authorization: Bearer SEU_TOKEN" \
  -F "file=@/caminho/foto.jpg"
```

## 2. LISTAR BIBLIOTECA
```bash
curl -X GET "http://localhost:3000/media?pagina=1&limite=10" \
  -H "Authorization: Bearer SEU_TOKEN"
```

## 3. BUSCAR POR TAGS
```bash
curl -X GET "http://localhost:3000/media/search?q=praia,cachorro" \
  -H "Authorization: Bearer SEU_TOKEN"
```

## 4. OBTER MÍDIA ESPECÍFICA
```bash
curl -X GET http://localhost:3000/media/ID_DA_MIDIA \
  -H "Authorization: Bearer SEU_TOKEN"
```

## 5. DELETAR MÍDIA
```bash
curl -X DELETE http://localhost:3000/media/ID_DA_MIDIA \
  -H "Authorization: Bearer SEU_TOKEN"
```