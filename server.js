require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// ========================= */
/* SEGURANÇA */
/* ========================= */

// Helmet - Protege contra vulnerabilidades HTTP
app.use(helmet());

// CORS - Controla origem das requisições
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting básico (em produção, usar redis)
const requestCounts = {};
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

app.use(rateLimit);

// ========================= */
/* MIDDLEWARE */
/* ========================= */

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ========================= */
/* BANCO DE DADOS */
/* ========================= */

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Erro ao conectar MongoDB: ${error.message}`);
    process.exit(1);
  }
};

connectDB();

// ========================= */
/* ROTAS */
/* ========================= */

// Rotas de autenticação
app.use('/api/auth', require('./routes/auth'));

// Rotas de mapa mental
app.use('/api/mentalmap', require('./routes/mentalmap'));

// Rotas de preview de sites
app.use('/api/preview', require('./routes/preview'));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Servidor funcionando normalmente',
    timestamp: new Date()
  });
});

// ========================= */
/* TRATAMENTO DE ERROS */
/* ========================= */

// 404 - Rota não encontrada
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

// Erro global
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// ========================= */
/* INICIAR SERVIDOR */
/* ========================= */

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📝 Ambiente: ${process.env.NODE_ENV}`);
  console.log(`🔒 CORS habilitado para: ${process.env.CORS_ORIGIN}`);
  console.log('\n✅ Sistema MentalMap Seguro iniciado com sucesso!\n');
});

module.exports = app;
