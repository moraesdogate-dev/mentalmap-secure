# 🧠 MentalMap Secure - Sistema Profissional de Mapas Mentais

Um sistema **seguro, profissional e escalável** de mapas mentais com autenticação JWT, MongoDB e proteção contra ataques.

## 🔒 Segurança

- ✅ **JWT Authentication** - Autenticação segura com tokens
- ✅ **Bcrypt Password Hashing** - Senhas criptografadas com 10 rounds
- ✅ **SQL Injection Protection** - Validação e sanitização de entrada
- ✅ **XSS Protection** - Escape de caracteres perigosos
- ✅ **CORS** - Controle de origem das requisições
- ✅ **Helmet** - Headers de segurança HTTP
- ✅ **Rate Limiting** - Proteção contra força bruta
- ✅ **Input Validation** - Validação rigorosa de dados

## 🚀 Instalação

### Pré-requisitos
- Node.js 14+
- MongoDB local ou remoto

### Passos

1. **Instalar dependências**
```bash
npm install
```

2. **Configurar variáveis de ambiente**
```bash
# Editar .env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/mentalmap
JWT_SECRET=seu_jwt_secret_super_seguro_aqui_123456789
JWT_EXPIRE=7d
BCRYPT_ROUNDS=10
CORS_ORIGIN=http://localhost:3000
```

3. **Iniciar servidor**
```bash
npm start
```

O servidor estará disponível em `http://localhost:5000`

## 📚 API Endpoints

### Autenticação

#### Registrar
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "seu_usuario",
  "email": "seu_email@example.com",
  "password": "SenhaForte123",
  "confirmPassword": "SenhaForte123"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "seu_email@example.com",
  "password": "SenhaForte123"
}
```

#### Obter Dados do Usuário
```
GET /api/auth/me
Authorization: Bearer {token}
```

### Mapas Mentais

#### Criar Mapa
```
POST /api/mentalmap
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Meu Primeiro Mapa",
  "description": "Descrição do mapa",
  "theme": "dark",
  "isPublic": false
}
```

#### Listar Mapas
```
GET /api/mentalmap
Authorization: Bearer {token}
```

#### Obter Mapa Específico
```
GET /api/mentalmap/{id}
Authorization: Bearer {token}
```

#### Atualizar Mapa
```
PUT /api/mentalmap/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Nome Atualizado",
  "theme": "light"
}
```

#### Adicionar Card
```
POST /api/mentalmap/{id}/cards
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "text",
  "title": "Título do Card",
  "content": "Conteúdo",
  "x": 100,
  "y": 200,
  "color": "#4da3ff"
}
```

#### Deletar Mapa
```
DELETE /api/mentalmap/{id}
Authorization: Bearer {token}
```

## 🔐 Validações

### Usuário
- Username: 3-30 caracteres, apenas letras, números, _ e -
- Email: Deve ser um email válido
- Senha: Mínimo 6 caracteres, com letras maiúsculas, minúsculas e números

### Mapa Mental
- Nome: 1-100 caracteres
- Descrição: Até 500 caracteres
- Tema: dark, light, neon ou cyberpunk

### Card
- Tipo: text, link ou image
- Título: Até 200 caracteres
- Conteúdo: Até 1000 caracteres
- URL: Deve ser uma URL válida

## 📁 Estrutura do Projeto

```
mentalmap-secure/
├── models/
│   ├── User.js              # Modelo de usuário
│   └── MentalMap.js         # Modelo de mapa mental
├── routes/
│   ├── auth.js              # Rotas de autenticação
│   └── mentalmap.js         # Rotas de mapa mental
├── middleware/
│   ├── auth.js              # Middleware de autenticação JWT
│   └── validation.js        # Middleware de validação
├── server.js                # Servidor principal
├── .env                     # Variáveis de ambiente
└── package.json             # Dependências
```

## 🛡️ Proteção contra Ataques

### SQL Injection
- Mongoose previne SQL injection automaticamente
- Validação rigorosa de entrada com express-validator
- Sanitização de strings

### XSS (Cross-Site Scripting)
- Escape de caracteres perigosos (<, >)
- Helmet protege headers HTTP
- Validação de tipo de dados

### CSRF (Cross-Site Request Forgery)
- CORS configurado corretamente
- Tokens JWT em headers Authorization

### Força Bruta
- Rate limiting: 100 requisições por minuto por IP
- Senhas hasheadas com bcrypt

## 📝 Exemplo de Uso

```javascript
// 1. Registrar usuário
const registerResponse = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'joao',
    email: 'joao@example.com',
    password: 'SenhaForte123',
    confirmPassword: 'SenhaForte123'
  })
});

const { token } = await registerResponse.json();

// 2. Criar mapa mental
const mapResponse = await fetch('http://localhost:5000/api/mentalmap', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Meu Mapa',
    description: 'Descrição',
    theme: 'dark'
  })
});

const { mentalMap } = await mapResponse.json();

// 3. Adicionar card
const cardResponse = await fetch(`http://localhost:5000/api/mentalmap/${mentalMap._id}/cards`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    type: 'text',
    title: 'Meu Card',
    content: 'Conteúdo',
    x: 100,
    y: 200,
    color: '#4da3ff'
  })
});
```

## 🚀 Próximos Passos

- [ ] Frontend React integrado
- [ ] Preview de sites (screenshots)
- [ ] Compartilhamento de mapas
- [ ] Colaboração em tempo real
- [ ] Exportar como imagem/PDF
- [ ] Integração com IA para sugestões

## 📄 Licença

ISC

## 👨‍💻 Autor

Desenvolvido com ❤️ e segurança em mente
