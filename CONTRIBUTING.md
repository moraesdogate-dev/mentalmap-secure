# 🤝 Contribuindo para MentalMap

Obrigado por considerar contribuir para o MentalMap! Este documento fornece diretrizes e instruções para contribuir.

## 📋 Código de Conduta

- Seja respeitoso com outros contribuidores
- Não tolere assédio ou discriminação
- Foque em críticas construtivas
- Respeite a privacidade e segurança dos dados

## 🚀 Como Começar

### 1. Fork o Repositório

```bash
git clone https://github.com/seu-usuario/mentalmap-secure.git
cd mentalmap-secure
```

### 2. Criar Branch

```bash
git checkout -b feature/sua-feature
# ou
git checkout -b fix/seu-bug
```

### 3. Instalar Dependências

```bash
npm install
cd client && npm install && cd ..
```

### 4. Criar Arquivo .env

```bash
cp .env.example .env
# Editar .env com suas configurações
```

## 📝 Processo de Contribuição

### Antes de Começar

1. Verifique se há uma issue aberta para o que você quer fazer
2. Se não houver, crie uma issue descrevendo a mudança
3. Aguarde feedback dos mantenedores

### Durante o Desenvolvimento

1. **Código Limpo**: Siga o estilo de código existente
2. **Commits Significativos**: Use mensagens claras
3. **Testes**: Adicione testes para novas funcionalidades
4. **Documentação**: Atualize docs conforme necessário

### Exemplo de Commit

```bash
# ✅ Bom
git commit -m "feat: adicionar preview de sites com cheerio"
git commit -m "fix: corrigir erro 400 em createMentalMap"
git commit -m "docs: atualizar README com instruções"

# ❌ Ruim
git commit -m "fix"
git commit -m "mudanças"
git commit -m "atualizações"
```

## 🧪 Testes

### Executar Testes

```bash
npm test
```

### Executar com Coverage

```bash
npm run test:coverage
```

### Testes em Watch Mode

```bash
npm run test:watch
```

### Adicionar Novos Testes

Crie testes em `tests/` seguindo o padrão:

```javascript
describe('Feature Name', () => {
  it('should do something', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = someFunction(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

## 🔐 Segurança

### Antes de Submeter

- [ ] Não há credenciais no código
- [ ] Não há `.env` commitado
- [ ] Validação de entrada está implementada
- [ ] XSS é prevenido
- [ ] SQL Injection é prevenido

### Reportar Vulnerabilidades

Se encontrar uma vulnerabilidade, **não** a divulgue publicamente. Envie um email para `security@mentalmap.com`.

## 📚 Estrutura do Projeto

```
mentalmap-secure/
├── server.js                 # Servidor principal
├── models/                   # Modelos Mongoose
├── routes/                   # Rotas Express
├── middleware/               # Middlewares
├── utils/                    # Utilitários
├── tests/                    # Testes
├── client/                   # Frontend React
│   ├── src/
│   │   ├── pages/           # Páginas
│   │   ├── context/         # Zustand stores
│   │   └── App.jsx          # App principal
│   └── package.json
├── .env.example             # Template de env
├── package.json             # Dependências
└── README.md                # Documentação
```

## 🎨 Estilo de Código

### JavaScript

```javascript
// ✅ Bom
const getUserById = async (id) => {
  const user = await User.findById(id);
  return user;
};

// ❌ Ruim
async function get_user_by_id(id){
const user=await User.findById(id)
return user}
```

### Nomes

- **Variáveis**: camelCase (`userName`, `isActive`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_RETRIES`, `API_URL`)
- **Funções**: camelCase (`getUserData`, `validateEmail`)
- **Classes**: PascalCase (`User`, `MentalMap`)

### Comentários

```javascript
// ✅ Bom - Explica o porquê
// Usar bcrypt com 10 rounds para melhor segurança
const hashedPassword = await bcryptjs.hash(password, 10);

// ❌ Ruim - Óbvio
// Hash a senha
const hashedPassword = await bcryptjs.hash(password, 10);
```

## 📋 Checklist antes de Submeter PR

- [ ] Branch atualizado com `main`
- [ ] Testes passam (`npm test`)
- [ ] Sem erros de linting
- [ ] Documentação atualizada
- [ ] Mensagens de commit claras
- [ ] Sem credenciais no código
- [ ] Mudanças testadas manualmente

## 🔄 Processo de Review

1. **Submeter PR**: Descreva suas mudanças claramente
2. **Review**: Mantenedores revisarão o código
3. **Feedback**: Responda aos comentários
4. **Merge**: Após aprovação, seu PR será mergeado

### Dicas para PR Aceito

- Mantenha PRs pequenos e focados
- Descreva bem o que foi mudado e por quê
- Adicione screenshots para mudanças visuais
- Responda aos comentários de forma construtiva

## 🐛 Reportando Bugs

### Ao Reportar

1. **Título Claro**: Descreva o problema em uma linha
2. **Reprodução**: Passos para reproduzir o bug
3. **Comportamento Esperado**: O que deveria acontecer
4. **Comportamento Atual**: O que realmente acontece
5. **Ambiente**: Node version, OS, navegador, etc.

### Exemplo

```markdown
## Título
Erro 400 ao criar mapa mental sem descrição

## Reprodução
1. Fazer login
2. Clicar em "Novo Mapa"
3. Deixar descrição vazia
4. Clicar em "Criar"

## Esperado
Mapa criado com descrição vazia

## Atual
Erro 400: "Descrição é obrigatória"

## Ambiente
- Node: 18.0.0
- OS: Windows 11
- Navegador: Chrome 120
```

## 💡 Sugestões de Funcionalidades

### Ao Sugerir

1. **Descrição Clara**: O que você quer adicionar?
2. **Caso de Uso**: Por que isso é útil?
3. **Exemplos**: Como seria usado?

### Exemplo

```markdown
## Título
Adicionar compartilhamento de mapas

## Descrição
Permitir que usuários compartilhem mapas mentais com outros usuários

## Caso de Uso
Um professor quer compartilhar um mapa com seus alunos

## Exemplos
- Botão "Compartilhar" no mapa
- Gerar link público
- Definir permissões (view, edit)
```

## 📚 Recursos

- [Git Workflow](https://git-scm.com/book/en/v2)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)
- [Testing Best Practices](https://jestjs.io/docs/getting-started)

## ❓ Dúvidas?

- Abra uma issue com a tag `question`
- Envie um email para `dev@mentalmap.com`
- Participe das discussões

## 🎉 Agradecimentos

Obrigado por contribuir para tornar o MentalMap melhor! 🚀

---

**Desenvolvido com ❤️ pela comunidade**
