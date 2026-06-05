# 🚀 Deployment - MentalMap

Guia completo para implantar o MentalMap em produção.

## 📋 Índice

1. [Preparação](#preparação)
2. [Deployment Local](#deployment-local)
3. [Deployment em Servidor](#deployment-em-servidor)
4. [Deployment em Plataformas Cloud](#deployment-em-plataformas-cloud)
5. [Monitoramento](#monitoramento)
6. [Troubleshooting](#troubleshooting)

---

## Preparação

### Checklist de Pré-Deployment

- [ ] Todos os testes passam (`npm test`)
- [ ] Cobertura de testes > 80%
- [ ] Sem vulnerabilidades (`npm audit`)
- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados preparado
- [ ] Backups configurados
- [ ] SSL/TLS certificado obtido
- [ ] Domínio apontado para servidor

### Variáveis de Ambiente Necessárias

```env
# Servidor
PORT=5000
NODE_ENV=production

# MongoDB
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/mentalmap

# JWT
JWT_SECRET=seu_jwt_secret_super_seguro_aleatorio_aqui
JWT_EXPIRE=7d

# Bcrypt
BCRYPT_ROUNDS=10

# CORS
CORS_ORIGIN=https://seu-dominio.com

# Frontend
VITE_API_URL=https://api.seu-dominio.com
```

---

## Deployment Local

### 1. Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/mentalmap-secure.git
cd mentalmap-secure

# Instale dependências
npm install
cd client && npm install && cd ..

# Configure variáveis de ambiente
cp .env.example .env
nano .env  # Edite com suas configurações
```

### 2. Iniciar Servidor

```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

### 3. Iniciar Frontend

```bash
cd client
npm run dev    # Desenvolvimento
npm run build  # Build para produção
```

---

## Deployment em Servidor

### Opção 1: Usando PM2 (Recomendado)

#### Instalação

```bash
# Instale PM2 globalmente
sudo npm install -g pm2

# Instale dependências
npm install
cd client && npm install && cd ..
```

#### Configuração

Crie `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'mentalmap-backend',
      script: './server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      ignore_watch: ['node_modules', 'logs', '.git']
    }
  ]
};
```

#### Iniciar

```bash
# Iniciar aplicação
pm2 start ecosystem.config.js

# Salvar configuração
pm2 save

# Configurar para iniciar no boot
pm2 startup
pm2 save
```

#### Monitorar

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs mentalmap-backend

# Reiniciar
pm2 restart mentalmap-backend

# Parar
pm2 stop mentalmap-backend
```

### Opção 2: Usando Systemd

Crie `/etc/systemd/system/mentalmap.service`:

```ini
[Unit]
Description=MentalMap Service
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/mentalmap-secure
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
EnvironmentFile=/home/ubuntu/mentalmap-secure/.env

[Install]
WantedBy=multi-user.target
```

Ativar:

```bash
sudo systemctl daemon-reload
sudo systemctl enable mentalmap
sudo systemctl start mentalmap
sudo systemctl status mentalmap
```

---

## Deployment em Plataformas Cloud

### Heroku

#### 1. Preparação

```bash
# Instale Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login

# Crie aplicação
heroku create seu-app-name
```

#### 2. Variáveis de Ambiente

```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=mongodb+srv://...
heroku config:set JWT_SECRET=seu_secret
heroku config:set CORS_ORIGIN=https://seu-app-name.herokuapp.com
```

#### 3. Deploy

```bash
git push heroku main
```

### Railway

#### 1. Preparação

```bash
# Instale Railway CLI
npm i -g @railway/cli

# Login
railway login

# Crie projeto
railway init
```

#### 2. Configuração

```bash
# Adicione variáveis
railway variables
```

#### 3. Deploy

```bash
railway up
```

### AWS EC2

#### 1. Instância

```bash
# Conecte via SSH
ssh -i seu-chave.pem ubuntu@seu-ip

# Atualize sistema
sudo apt update && sudo apt upgrade -y

# Instale Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instale PM2
sudo npm install -g pm2
```

#### 2. Clone e Configure

```bash
git clone https://github.com/seu-usuario/mentalmap-secure.git
cd mentalmap-secure
npm install
cd client && npm install && cd ..
```

#### 3. Configure Nginx (Reverse Proxy)

```bash
sudo apt install -y nginx

# Crie configuração
sudo nano /etc/nginx/sites-available/mentalmap
```

Conteúdo:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ativar:

```bash
sudo ln -s /etc/nginx/sites-available/mentalmap /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 4. SSL com Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com
```

---

## Monitoramento

### Logs

```bash
# PM2
pm2 logs mentalmap-backend

# Systemd
sudo journalctl -u mentalmap -f

# Nginx
sudo tail -f /var/log/nginx/error.log
```

### Métricas

```bash
# PM2 Monitoring
pm2 monit

# CPU e Memória
top
htop

# Disco
df -h
```

### Alertas

Configure alertas para:
- CPU > 80%
- Memória > 80%
- Disco > 90%
- Erro rate > 5%
- Response time > 1s

---

## Troubleshooting

### Erro: "Port already in use"

```bash
# Encontre processo
lsof -i :5000

# Mate processo
kill -9 <PID>
```

### Erro: "Cannot connect to MongoDB"

```bash
# Verifique conexão
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/mentalmap"

# Verifique IP whitelist no MongoDB Atlas
# Verifique credenciais no .env
```

### Erro: "Out of memory"

```bash
# Aumente limite
pm2 start ecosystem.config.js --max-memory-restart 2G

# Ou configure no ecosystem.config.js
max_memory_restart: '2G'
```

### Erro: "CORS error"

```bash
# Verifique CORS_ORIGIN no .env
# Deve ser exatamente o domínio do frontend
CORS_ORIGIN=https://seu-dominio.com
```

### Erro: "SSL certificate error"

```bash
# Renove certificado
sudo certbot renew --dry-run

# Ou renove manualmente
sudo certbot renew
```

---

## Performance

### Otimizações

1. **Compressão Gzip**

```javascript
const compression = require('compression');
app.use(compression());
```

2. **Caching**

```javascript
app.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=3600');
  next();
});
```

3. **Rate Limiting em Produção**

Use Redis:

```bash
npm install redis express-rate-limit
```

4. **Database Indexing**

```javascript
// Já configurado em models/MentalMap.js
mentalMapSchema.index({ userId: 1, createdAt: -1 });
```

---

## Backup e Recuperação

### MongoDB Backup

```bash
# Backup
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/mentalmap" \
  --out=/backups/mentalmap-$(date +%Y%m%d)

# Restore
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/mentalmap" \
  /backups/mentalmap-20240101
```

### Backup Automático

Crie script `backup.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mentalmap-$DATE"

mongodump --uri="$MONGODB_URI" --out=$BACKUP_DIR

# Comprimir
tar -czf $BACKUP_DIR.tar.gz $BACKUP_DIR
rm -rf $BACKUP_DIR

# Enviar para S3
aws s3 cp $BACKUP_DIR.tar.gz s3://seu-bucket/backups/
```

Agende com cron:

```bash
# Backup diário às 2 AM
0 2 * * * /home/ubuntu/mentalmap-secure/backup.sh
```

---

## Segurança em Produção

### Checklist

- [ ] HTTPS habilitado (SSL/TLS)
- [ ] Firewall configurado
- [ ] Senhas fortes em .env
- [ ] Rate limiting ativo
- [ ] Logs de auditoria habilitados
- [ ] Backups automatizados
- [ ] Monitoramento ativo
- [ ] Atualizações de segurança aplicadas

### Headers de Segurança

Já configurados via Helmet:

```javascript
app.use(helmet());
```

---

## Rollback

Se algo der errado:

```bash
# PM2
pm2 restart mentalmap-backend

# Ou
git revert <commit-hash>
npm install
pm2 restart mentalmap-backend
```

---

## Suporte

Para problemas durante deployment:

1. Verifique logs: `pm2 logs` ou `journalctl`
2. Verifique variáveis de ambiente: `env | grep NODE`
3. Teste conectividade: `curl http://localhost:5000/api/health`
4. Verifique firewall: `sudo ufw status`

---

**Deployado com confiança** 🚀
