const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  id: String,
  type: {
    type: String,
    enum: ['text', 'link', 'image'],
    default: 'text'
  },
  title: String,
  content: String,
  url: String,
  description: String,
  imageSrc: String,
  x: Number,
  y: Number,
  color: String
});

const connectionSchema = new mongoose.Schema({
  card1Id: String,
  card2Id: String,
  color: String
});

const mentalMapSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Por favor, forneça um nome para o mapa'],
    trim: true,
    maxlength: [100, 'Nome deve ter no máximo 100 caracteres']
  },
  description: {
    type: String,
    maxlength: [500, 'Descrição deve ter no máximo 500 caracteres']
  },
  cards: [cardSchema],
  connections: [connectionSchema],
  theme: {
    type: String,
    enum: ['dark', 'light', 'neon', 'cyberpunk'],
    default: 'dark'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Índice para buscar mapas por usuário
mentalMapSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('MentalMap', mentalMapSchema);
