# 📚 API Documentation - MentalMap

Documentação completa da API REST do MentalMap.

## 🔗 Base URL

```
http://localhost:5000/api
```

Em produção:

```
https://api.seu-dominio.com
```

## 🔐 Autenticação

Todos os endpoints protegidos requerem um token JWT no header:

```
Authorization: Bearer {token}
```

Exemplo:

```bash
curl -H "Authorization: Bearer seu_token_aqui" \
  http://localhost:5000/api/auth/me
```

---

## 📝 Endpoints

### Autenticação

#### Registrar

```http
POST /auth/register
Content-Type: application/json

{
  "username": "joao",
  "email": "joao@example.com",
  "password": "SenhaForte123",
  "confirmPassword": "SenhaForte123"
}
```

**Resposta (201):**

```json
{
  "success": true,
  "message": "Usuário registrado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "joao",
    "email": "joao@example.com",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Erros:**

- `400` - Email já existe ou dados inválidos
- `422` - Validação falhou

---

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "joao@example.com",
  "password": "SenhaForte123"
}
```

**Resposta (200):**

```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "joao",
    "email": "joao@example.com"
  }
}
```

**Erros:**

- `400` - Email ou senha incorretos
- `404` - Usuário não encontrado

---

#### Obter Dados do Usuário

```http
GET /auth/me
Authorization: Bearer {token}
```

**Resposta (200):**

```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "joao",
    "email": "joao@example.com",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Erros:**

- `401` - Token não fornecido ou inválido

---

### Mapas Mentais

#### Criar Mapa

```http
POST /mentalmap
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Meu Primeiro Mapa",
  "description": "Descrição do mapa",
  "theme": "dark",
  "isPublic": false
}
```

**Campos:**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| name | string | Sim | Nome do mapa (1-100 caracteres) |
| description | string | Não | Descrição (até 500 caracteres) |
| theme | string | Não | Tema: dark, light, neon, cyberpunk |
| isPublic | boolean | Não | Se o mapa é público |

**Resposta (201):**

```json
{
  "success": true,
  "message": "Mapa criado com sucesso",
  "mentalMap": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "name": "Meu Primeiro Mapa",
    "description": "Descrição do mapa",
    "theme": "dark",
    "isPublic": false,
    "cards": [],
    "connections": [],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

#### Listar Mapas

```http
GET /mentalmap
Authorization: Bearer {token}
```

**Query Parameters:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| page | number | Página (padrão: 1) |
| limit | number | Itens por página (padrão: 10) |

**Resposta (200):**

```json
{
  "success": true,
  "mentalMaps": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Meu Primeiro Mapa",
      "description": "Descrição",
      "theme": "dark",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "pages": 1
}
```

---

#### Obter Mapa Específico

```http
GET /mentalmap/{id}
Authorization: Bearer {token}
```

**Resposta (200):**

```json
{
  "success": true,
  "mentalMap": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "name": "Meu Primeiro Mapa",
    "description": "Descrição",
    "theme": "dark",
    "cards": [
      {
        "id": "1234567890",
        "type": "text",
        "title": "Card 1",
        "content": "Conteúdo",
        "x": 100,
        "y": 100,
        "color": "#3b82f6"
      }
    ],
    "connections": [],
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Erros:**

- `404` - Mapa não encontrado

---

#### Atualizar Mapa

```http
PUT /mentalmap/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Nome Atualizado",
  "description": "Nova descrição",
  "theme": "light"
}
```

**Resposta (200):**

```json
{
  "success": true,
  "message": "Mapa atualizado com sucesso",
  "mentalMap": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Nome Atualizado",
    "description": "Nova descrição",
    "theme": "light",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

---

#### Deletar Mapa

```http
DELETE /mentalmap/{id}
Authorization: Bearer {token}
```

**Resposta (200):**

```json
{
  "success": true,
  "message": "Mapa deletado com sucesso"
}
```

---

### Cards

#### Adicionar Card

```http
POST /mentalmap/{id}/cards
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "text",
  "title": "Título do Card",
  "content": "Conteúdo do card",
  "x": 100,
  "y": 100,
  "color": "#3b82f6"
}
```

**Campos:**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| type | string | Sim | text, link ou image |
| title | string | Sim | Título (até 200 caracteres) |
| content | string | Não | Conteúdo (até 1000 caracteres) |
| url | string | Não | URL (para link/image) |
| description | string | Não | Descrição (para preview) |
| imageSrc | string | Não | URL da imagem |
| x | number | Sim | Posição X |
| y | number | Sim | Posição Y |
| color | string | Não | Cor em hex |

**Resposta (201):**

```json
{
  "success": true,
  "message": "Card adicionado com sucesso",
  "card": {
    "id": "1234567890",
    "type": "text",
    "title": "Título do Card",
    "content": "Conteúdo do card",
    "x": 100,
    "y": 100,
    "color": "#3b82f6"
  }
}
```

---

#### Card com Link e Preview

```http
POST /mentalmap/{id}/cards
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "link",
  "title": "Exemplo",
  "url": "https://example.com",
  "description": "Descrição do site",
  "imageSrc": "https://example.com/image.jpg",
  "x": 200,
  "y": 200
}
```

---

### Preview de Sites

#### Buscar Preview

```http
GET /preview?url=https://example.com
Authorization: Bearer {token}
```

**Query Parameters:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| url | string | Sim | URL do site |

**Resposta (200):**

```json
{
  "success": true,
  "data": {
    "url": "https://example.com",
    "title": "Example Domain",
    "description": "Example Domain. This domain is for use in examples...",
    "image": "https://example.com/image.jpg",
    "favicon": "https://www.google.com/s2/favicons?domain=example.com&sz=64",
    "domain": "example.com"
  }
}
```

**Erros:**

- `400` - URL inválida ou inacessível

---

### Health Check

#### Status do Servidor

```http
GET /health
```

**Resposta (200):**

```json
{
  "success": true,
  "message": "Servidor funcionando normalmente",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 🔍 Códigos de Status

| Código | Significado |
|--------|-------------|
| 200 | OK - Requisição bem-sucedida |
| 201 | Created - Recurso criado |
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Token inválido/ausente |
| 403 | Forbidden - Acesso negado |
| 404 | Not Found - Recurso não encontrado |
| 429 | Too Many Requests - Rate limit atingido |
| 500 | Internal Server Error - Erro do servidor |

---

## 🛡️ Validações

### Usuário

```
username: 3-30 caracteres, apenas letras, números, _ e -
email: Email válido
password: Mín. 6 caracteres, maiúscula, minúscula, número
```

### Mapa

```
name: 1-100 caracteres
description: Até 500 caracteres
theme: dark | light | neon | cyberpunk
```

### Card

```
type: text | link | image
title: Até 200 caracteres
content: Até 1000 caracteres
x, y: Números inteiros
```

---

## 📊 Exemplos com cURL

### Registrar

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "joao",
    "email": "joao@example.com",
    "password": "SenhaForte123",
    "confirmPassword": "SenhaForte123"
  }'
```

### Criar Mapa

```bash
curl -X POST http://localhost:5000/api/mentalmap \
  -H "Authorization: Bearer seu_token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Meu Mapa",
    "description": "Descrição"
  }'
```

### Adicionar Card

```bash
curl -X POST http://localhost:5000/api/mentalmap/seu_map_id/cards \
  -H "Authorization: Bearer seu_token" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "text",
    "title": "Card",
    "content": "Conteúdo",
    "x": 100,
    "y": 100
  }'
```

---

## 🔗 Recursos

- [Postman Collection](./postman-collection.json)
- [OpenAPI Specification](./openapi.yaml)
- [Webhook Documentation](./WEBHOOKS.md)

---

**Documentação atualizada em: 2024-01-15**
