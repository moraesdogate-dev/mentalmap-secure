# 🔐 Segurança - MentalMap Secure

Documento detalhado sobre as medidas de segurança implementadas no MentalMap.

## 📋 Índice

1. [Proteção contra SQL Injection](#proteção-contra-sql-injection)
2. [Proteção contra XSS](#proteção-contra-xss)
3. [Proteção contra CSRF](#proteção-contra-csrf)
4. [Autenticação e Autorização](#autenticação-e-autorização)
5. [Criptografia de Dados](#criptografia-de-dados)
6. [Rate Limiting](#rate-limiting)
7. [CORS](#cors)
8. [Headers de Segurança](#headers-de-segurança)
9. [Validação de Entrada](#validação-de-entrada)
10. [Boas Práticas](#boas-práticas)

---

## Proteção contra SQL Injection

### Implementação

O MentalMap usa **MongoDB** em vez de SQL tradicional, o que oferece proteção inerente contra SQL Injection. Além disso:

- **Mongoose ODM**: Previne injeção de queries automaticamente
- **Validação de Entrada**: Todas as entradas são validadas com `express-validator`
- **Sanitização**: Strings perigosas são escapadas

### Exemplo de Proteção

```javascript
// ❌ Vulnerável (não usado)
const user = await User.findOne({ email: req.body.email });

// ✅ Seguro (implementado)
const { validationResult } = require('express-validator');
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}
```

### Testes

Execute testes de SQL Injection:
```bash
npm test -- tests/security.test.js
```

---

## Proteção contra XSS

### Implementação

- **Escape de Caracteres**: Caracteres perigosos (`<`, `>`, `&`) são escapados
- **Helmet**: Adiciona headers de segurança (X-Content-Type-Options, X-Frame-Options)
- **Validação de Tipo**: Apenas dados esperados são aceitos

### Exemplo de Proteção

```javascript
// ❌ Vulnerável
const title = req.body.title; // "<script>alert('XSS')</script>"

// ✅ Seguro
const title = sanitizeString(req.body.title);
// Resultado: "&lt;script&gt;alert('XSS')&lt;/script&gt;"
```

### Middleware de Sanitização

```javascript
// middleware/validation.js
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};
```

---

## Proteção contra CSRF

### Implementação

- **CORS Configurado**: Apenas origens autorizadas podem fazer requisições
- **Tokens JWT**: Armazenados em headers (não em cookies automáticos)
- **SameSite Cookies**: Proteção adicional contra CSRF

### Configuração CORS

```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## Autenticação e Autorização

### Implementação

- **JWT (JSON Web Tokens)**: Tokens seguros com expiração
- **Bcrypt**: Senhas hasheadas com 10 rounds
- **Middleware de Autenticação**: Verifica token em cada requisição protegida

### Fluxo de Autenticação

```
1. Usuário registra/faz login
2. Servidor cria JWT com expiração (7 dias)
3. Cliente armazena token
4. Cada requisição envia token no header Authorization
5. Servidor verifica token antes de processar
```

### Exemplo de Middleware

```javascript
// middleware/auth.js
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token não fornecido'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};
```

---

## Criptografia de Dados

### Senhas

- **Algoritmo**: Bcrypt com 10 rounds
- **Tempo de Hash**: ~100ms por senha
- **Proteção**: Impossível recuperar senha original

```javascript
// Hashing
const hashedPassword = await bcryptjs.hash(password, 10);

// Verificação
const isValid = await bcryptjs.compare(password, hashedPassword);
```

### Dados em Trânsito

- **HTTPS**: Use em produção (não HTTP)
- **TLS 1.2+**: Criptografia de conexão

---

## Rate Limiting

### Implementação

- **Limite**: 100 requisições por minuto por IP
- **Proteção**: Contra força bruta e DDoS

```javascript
const rateLimit = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  
  if (!requestCounts[ip]) {
    requestCounts[ip] = [];
  }
  
  // Remover requisições antigas (mais de 1 minuto)
  requestCounts[ip] = requestCounts[ip].filter(time => now - time < 60000);
  
  // Limitar a 100 requisições por minuto
  if (requestCounts[ip].length > 100) {
    return res.status(429).json({
      success: false,
      message: 'Muitas requisições. Tente novamente mais tarde.'
    });
  }
  
  requestCounts[ip].push(now);
  next();
};
```

**Nota**: Em produção, use Redis para rate limiting distribuído.

---

## CORS

### Configuração

```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Variáveis de Ambiente

```env
# Apenas localhost em desenvolvimento
CORS_ORIGIN=http://localhost:3000

# Em produção, use seu domínio
CORS_ORIGIN=https://mentalmap.com
```

---

## Headers de Segurança

### Helmet

O Helmet adiciona automaticamente headers de segurança:

```javascript
app.use(helmet());
```

Headers adicionados:

| Header | Proteção |
|--------|----------|
| X-Content-Type-Options | Previne MIME sniffing |
| X-Frame-Options | Previne clickjacking |
| X-XSS-Protection | Proteção XSS no navegador |
| Strict-Transport-Security | Força HTTPS |
| Content-Security-Policy | Controla recursos carregados |

---

## Validação de Entrada

### Regras de Validação

#### Usuário

```javascript
// Username
- Mínimo: 3 caracteres
- Máximo: 30 caracteres
- Permitido: letras, números, _, -

// Email
- Deve ser um email válido
- Máximo: 255 caracteres

// Senha
- Mínimo: 6 caracteres
- Deve conter: maiúscula, minúscula, número
```

#### Mapa Mental

```javascript
// Nome
- Mínimo: 1 caractere
- Máximo: 100 caracteres

// Descrição
- Máximo: 500 caracteres

// Tema
- Valores permitidos: dark, light, neon, cyberpunk
```

#### Card

```javascript
// Tipo
- Valores permitidos: text, link, image

// Título
- Máximo: 200 caracteres

// Conteúdo
- Máximo: 1000 caracteres

// URL (se tipo = link)
- Deve ser uma URL válida
```

### Implementação

```javascript
const { body, validationResult } = require('express-validator');

app.post('/api/auth/register', [
  body('email').isEmail().normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .matches(/[A-Z]/) // Maiúscula
    .matches(/[a-z]/) // Minúscula
    .matches(/[0-9]/) // Número
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Processar...
});
```

---

## Boas Práticas

### 1. Variáveis de Ambiente

**Nunca** comite `.env` no Git:

```bash
# .gitignore
.env
.env.local
.env.*.local
```

Use `.env.example`:

```env
# .env.example
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mentalmap
JWT_SECRET=seu_jwt_secret_aqui
```

### 2. Senhas Fortes

Exija senhas com:
- Mínimo 6 caracteres
- Pelo menos 1 maiúscula
- Pelo menos 1 minúscula
- Pelo menos 1 número

### 3. HTTPS em Produção

```javascript
// Redirecionar HTTP para HTTPS
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});
```

### 4. Logging de Segurança

```javascript
// Log tentativas de acesso não autorizado
app.use((err, req, res, next) => {
  if (err.status === 401) {
    console.warn(`[SECURITY] Unauthorized access attempt from ${req.ip}`);
  }
  next(err);
});
```

### 5. Monitoramento

- Monitore tentativas de login falhadas
- Alerte sobre atividades suspeitas
- Mantenha logs de auditoria

### 6. Atualizações de Dependências

Mantenha dependências atualizadas:

```bash
npm outdated
npm update
npm audit
npm audit fix
```

### 7. Testes de Segurança

Execute testes regularmente:

```bash
npm test
npm run test:coverage
```

### 8. Backup de Dados

- Faça backup regular do MongoDB
- Teste restauração de backups
- Armazene backups em local seguro

### 9. Controle de Acesso

- Use roles (admin, user)
- Implemente permissões granulares
- Verifique autorização em cada endpoint

### 10. Comunicação Segura

- Use HTTPS sempre
- Valide certificados SSL/TLS
- Use headers de segurança

---

## Checklist de Segurança

- [ ] `.env` não está no Git
- [ ] Senhas são hasheadas com bcrypt
- [ ] Tokens JWT têm expiração
- [ ] CORS está configurado corretamente
- [ ] Rate limiting está ativo
- [ ] Helmet está habilitado
- [ ] Validação de entrada está implementada
- [ ] XSS é prevenido
- [ ] SQL Injection é prevenido
- [ ] HTTPS é usado em produção
- [ ] Logs de segurança são mantidos
- [ ] Testes de segurança passam
- [ ] Dependências estão atualizadas
- [ ] Backups são feitos regularmente

---

## Reportar Vulnerabilidades

Se encontrar uma vulnerabilidade de segurança, **não** a divulgue publicamente. Em vez disso:

1. Envie um email para `security@mentalmap.com`
2. Descreva a vulnerabilidade em detalhes
3. Aguarde resposta em 48 horas

---

## Recursos Adicionais

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Desenvolvido com segurança em mente** 🔒
