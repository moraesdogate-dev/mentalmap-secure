# 🧪 Tests - MentalMap

Testes automatizados para o sistema MentalMap.

## 📋 Estrutura

```
tests/
├── auth.test.js         # Testes de autenticação
├── mentalmap.test.js    # Testes de mapas mentais
├── security.test.js     # Testes de segurança
├── preview.test.js      # Testes de preview de sites
└── README.md            # Este arquivo
```

## 🚀 Executar Testes

### Todos os testes

```bash
npm test
```

### Testes específicos

```bash
npm test -- tests/auth.test.js
npm test -- tests/mentalmap.test.js
npm test -- tests/security.test.js
npm test -- tests/preview.test.js
```

### Watch mode (reexecuta ao salvar)

```bash
npm run test:watch
```

### Com coverage

```bash
npm run test:coverage
```

## 📊 Cobertura de Testes

### Autenticação (auth.test.js)

- ✅ Registrar novo usuário
- ✅ Rejeitar senhas fracas
- ✅ Rejeitar senhas não correspondentes
- ✅ Rejeitar email inválido
- ✅ Rejeitar email duplicado
- ✅ Login com credenciais corretas
- ✅ Rejeitar senha incorreta
- ✅ Rejeitar usuário inexistente
- ✅ Retornar dados do usuário com token válido
- ✅ Rejeitar requisição sem token
- ✅ Rejeitar token inválido

### Mapas Mentais (mentalmap.test.js)

- ✅ Criar novo mapa mental
- ✅ Rejeitar mapa sem nome
- ✅ Rejeitar nome muito longo
- ✅ Rejeitar sem autenticação
- ✅ Listar mapas do usuário
- ✅ Obter mapa específico
- ✅ Retornar 404 para mapa inexistente
- ✅ Atualizar mapa mental
- ✅ Impedir atualização de mapas de outros usuários
- ✅ Adicionar card de texto
- ✅ Adicionar card de link com preview
- ✅ Rejeitar card sem campos obrigatórios
- ✅ Rejeitar tipo de card inválido
- ✅ Deletar mapa mental
- ✅ Impedir deleção de mapas de outros usuários

### Segurança (security.test.js)

- ✅ Proteção contra SQL Injection no login
- ✅ Proteção contra SQL Injection no registro
- ✅ Sanitização de XSS em título de mapa
- ✅ Sanitização de XSS em conteúdo de card
- ✅ Validação de email vazio
- ✅ Validação de senha vazia
- ✅ Rejeição de strings muito longas
- ✅ Rate limiting de requisições
- ✅ Rejeição de tokens expirados
- ✅ Rejeição de tokens alterados
- ✅ Headers CORS incluídos
- ✅ Rejeição de origens não autorizadas

### Preview de Sites (preview.test.js)

- ✅ Rejeitar sem autenticação
- ✅ Rejeitar sem parâmetro URL
- ✅ Rejeitar URL inválida
- ✅ Rejeitar URL sem protocolo
- ✅ Processar URLs válidas
- ✅ Lidar com URLs inacessíveis

## 🔧 Configuração

### Arquivo de Configuração (jest.config.js)

```javascript
module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'routes/**/*.js',
    'middleware/**/*.js',
    'models/**/*.js',
    'utils/**/*.js',
    '!**/node_modules/**'
  ],
  testTimeout: 10000,
  verbose: true
};
```

## 📝 Escrevendo Novos Testes

### Estrutura Básica

```javascript
const request = require('supertest');
const app = require('../server');

describe('Feature Name', () => {
  it('should do something', async () => {
    const response = await request(app)
      .post('/api/endpoint')
      .send({ data: 'test' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

### Padrão AAA (Arrange, Act, Assert)

```javascript
it('should create a user', async () => {
  // Arrange - Preparar dados
  const userData = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'TestPassword123'
  };

  // Act - Executar ação
  const response = await request(app)
    .post('/api/auth/register')
    .send(userData);

  // Assert - Verificar resultado
  expect(response.status).toBe(201);
  expect(response.body.user.email).toBe(userData.email);
});
```

### Testes Assíncronos

```javascript
beforeAll(async () => {
  // Setup antes de todos os testes
});

afterAll(async () => {
  // Cleanup após todos os testes
});

beforeEach(async () => {
  // Setup antes de cada teste
});

afterEach(async () => {
  // Cleanup após cada teste
});
```

## 🐛 Troubleshooting

### Erro: "Cannot connect to MongoDB"

```bash
# Verifique se MongoDB está rodando
# Ou configure MONGODB_URI no .env
export MONGODB_URI=mongodb://localhost:27017/mentalmap-test
npm test
```

### Erro: "Test timeout exceeded"

Aumente o timeout no jest.config.js:

```javascript
testTimeout: 20000 // 20 segundos
```

### Erro: "Port already in use"

O servidor pode estar rodando em outro processo:

```bash
# Encontre o processo
lsof -i :5000

# Mate o processo
kill -9 <PID>
```

## 📈 Métricas de Cobertura

Após executar `npm run test:coverage`, você verá:

```
File      | % Stmts | % Branch | % Funcs | % Lines
----------|---------|----------|---------|--------
All files |   85.2  |   78.5   |   90.1  |   85.0
```

Objetivo: Manter cobertura acima de 80%.

## ✅ Checklist antes de Commit

- [ ] Todos os testes passam (`npm test`)
- [ ] Cobertura está acima de 80% (`npm run test:coverage`)
- [ ] Sem erros de linting
- [ ] Novos testes para novas funcionalidades
- [ ] Testes de segurança inclusos

## 🔗 Recursos

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)

---

**Desenvolvido com testes em mente** ✅
