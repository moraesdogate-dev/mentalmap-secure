# 🐙 GitHub Setup - MentalMap

Guia completo para configurar e publicar o MentalMap no GitHub.

## 📋 Índice

1. [Criar Repositório](#criar-repositório)
2. [Configurar Git Localmente](#configurar-git-localmente)
3. [Push para GitHub](#push-para-github)
4. [Configurar Proteções](#configurar-proteções)
5. [CI/CD com GitHub Actions](#cicd-com-github-actions)
6. [Boas Práticas](#boas-práticas)

---

## Criar Repositório

### 1. No GitHub

1. Acesse [github.com/new](https://github.com/new)
2. Nome do repositório: `mentalmap-secure`
3. Descrição: "Sistema seguro de mapas mentais com MongoDB e autenticação JWT"
4. Escolha **Private** ou **Public**
5. **Não** inicialize com README (já temos)
6. Clique em "Create repository"

### 2. Copiar URL

Você verá uma URL como:

```
https://github.com/moraesdogate-dev/mentalmap-secure.git
```

Ou com SSH:

```
git@github.com:moraesdogate-dev/mentalmap-secure.git
```

---

## Configurar Git Localmente

### 1. Adicionar Remote

```bash
cd /home/ubuntu/mentalmap-secure

# Com HTTPS
git remote add origin https://github.com/moraesdogate-dev/mentalmap-secure.git

# Ou com SSH (se tiver chave SSH configurada)
git remote add origin git@github.com:moraesdogate-dev/mentalmap-secure.git
```

### 2. Verificar Remote

```bash
git remote -v
```

Você verá:

```
origin  https://github.com/moraesdogate-dev/mentalmap-secure.git (fetch)
origin  https://github.com/moraesdogate-dev/mentalmap-secure.git (push)
```

### 3. Configurar Branch Principal

```bash
# Renomear master para main (opcional, mas recomendado)
git branch -M main
```

---

## Push para GitHub

### 1. Primeiro Push

```bash
# Push do branch principal
git push -u origin main
```

Você será solicitado a autenticar:

- **HTTPS**: Digite seu GitHub username e personal access token
- **SSH**: Será usado sua chave SSH

### 2. Verificar Push

Acesse seu repositório no GitHub e verifique se os arquivos aparecem.

---

## Configurar Proteções

### 1. Branch Protection Rules

1. Vá para **Settings** → **Branches**
2. Clique em **Add rule**
3. Branch name pattern: `main`
4. Ative:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Require code reviews before merging (1 reviewer)
   - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ✅ Require status checks to pass

### 2. Configurar Secrets

Para CI/CD, adicione secrets em **Settings** → **Secrets and variables** → **Actions**:

```
MONGODB_URI=seu_mongodb_uri
JWT_SECRET=seu_jwt_secret
```

---

## CI/CD com GitHub Actions

### 1. Criar Workflow

Crie `.github/workflows/test.yml`:

```yaml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      mongodb:
        image: mongo:latest
        options: >-
          --health-cmd mongosh
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 27017:27017

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm install

    - name: Run tests
      run: npm test
      env:
        MONGODB_URI: mongodb://localhost:27017/mentalmap-test
        JWT_SECRET: test-secret
        NODE_ENV: test

    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        files: ./coverage/lcov.info
```

### 2. Criar Workflow de Deploy

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
        heroku_app_name: ${{ secrets.HEROKU_APP_NAME }}
        heroku_email: ${{ secrets.HEROKU_EMAIL }}
```

### 3. Adicionar Secrets para Deploy

Em **Settings** → **Secrets and variables** → **Actions**:

```
HEROKU_API_KEY=sua_heroku_api_key
HEROKU_APP_NAME=seu_app_name
HEROKU_EMAIL=seu_email@example.com
```

---

## Boas Práticas

### 1. .gitignore

Já configurado, mas verifique:

```
node_modules/
.env
.env.local
dist/
build/
.DS_Store
*.log
```

### 2. Commits

Use conventional commits:

```bash
# Feature
git commit -m "feat: adicionar preview de sites"

# Bug fix
git commit -m "fix: corrigir erro 400 em createMentalMap"

# Documentation
git commit -m "docs: atualizar README"

# Tests
git commit -m "test: adicionar testes de segurança"

# Refactor
git commit -m "refactor: melhorar validação de entrada"

# Performance
git commit -m "perf: otimizar queries do MongoDB"
```

### 3. Pull Requests

Template para PR (crie `.github/pull_request_template.md`):

```markdown
## Descrição
Descreva suas mudanças aqui.

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentation update

## Checklist
- [ ] Meu código segue o estilo do projeto
- [ ] Executei `npm test` e todos passam
- [ ] Adicionei testes para novas funcionalidades
- [ ] Atualizei documentação
- [ ] Não há conflitos com `main`

## Screenshots (se aplicável)
Adicione screenshots aqui.

## Issues Relacionadas
Closes #123
```

### 4. Issues

Use labels:

- `bug` - Relatório de bug
- `enhancement` - Nova feature
- `documentation` - Documentação
- `good first issue` - Bom para iniciantes
- `help wanted` - Precisa de ajuda
- `security` - Problema de segurança

### 5. Releases

Crie releases para versões:

```bash
# Tag
git tag -a v1.0.0 -m "Version 1.0.0"
git push origin v1.0.0
```

No GitHub, crie release a partir da tag com notas.

---

## Colaboração

### 1. Adicionar Colaboradores

**Settings** → **Collaborators** → **Add people**

### 2. Permissões

- **Pull** - Apenas leitura
- **Triage** - Leitura + gerenciar issues
- **Push** - Leitura + escrita
- **Maintain** - Tudo exceto deletar
- **Admin** - Acesso total

### 3. Code Review

Sempre faça code review antes de merge:

1. Crie branch para feature
2. Faça commits
3. Abra Pull Request
4. Aguarde review
5. Faça ajustes se necessário
6. Merge após aprovação

---

## Monitoramento

### 1. GitHub Insights

Vá para **Insights** para ver:

- Commits por semana
- Contribuidores
- Network (branches)
- Traffic (visualizações)

### 2. Dependabot

Ative em **Settings** → **Code security and analysis**:

- ✅ Dependabot alerts
- ✅ Dependabot security updates
- ✅ Dependabot version updates

### 3. Code Scanning

Com GitHub Advanced Security:

- Análise de código automática
- Alertas de segurança
- Secret scanning

---

## Troubleshooting

### Erro: "fatal: remote origin already exists"

```bash
git remote remove origin
git remote add origin https://github.com/seu-usuario/mentalmap-secure.git
```

### Erro: "Permission denied (publickey)"

Configure SSH:

```bash
# Gere chave SSH
ssh-keygen -t ed25519 -C "seu-email@example.com"

# Adicione ao ssh-agent
ssh-add ~/.ssh/id_ed25519

# Copie chave pública
cat ~/.ssh/id_ed25519.pub

# Adicione em GitHub Settings → SSH and GPG keys
```

### Erro: "fatal: 'origin' does not appear to be a 'git' repository"

```bash
# Verifique remote
git remote -v

# Se vazio, adicione
git remote add origin https://github.com/seu-usuario/mentalmap-secure.git
```

### Erro: "Updates were rejected because the remote contains work"

```bash
# Puxe mudanças
git pull origin main

# Resolva conflitos se houver
# Depois faça push
git push origin main
```

---

## Próximos Passos

1. ✅ Criar repositório
2. ✅ Configurar Git localmente
3. ✅ Fazer push inicial
4. ✅ Configurar proteções
5. ✅ Adicionar CI/CD
6. ⬜ Adicionar colaboradores
7. ⬜ Criar primeira release
8. ⬜ Configurar GitHub Pages (opcional)

---

## Recursos

- [GitHub Docs](https://docs.github.com)
- [Git Documentation](https://git-scm.com/doc)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Actions](https://github.com/features/actions)

---

**Pronto para colaborar no GitHub** 🚀
