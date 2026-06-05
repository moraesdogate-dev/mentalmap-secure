const express = require('express');
const MentalMap = require('../models/MentalMap');
const { protect } = require('../middleware/auth');
const { validateMentalMap, validateCard, handleValidationErrors, sanitizeInput } = require('../middleware/validation');
const { param, body } = require('express-validator');

const router = express.Router();

// Aplicar sanitização em todas as rotas
router.use(sanitizeInput);

// @route   POST /api/mentalmap
// @desc    Criar novo mapa mental
// @access  Private
router.post('/', protect, validateMentalMap, handleValidationErrors, async (req, res) => {
  try {
    const { name, description, theme, isPublic } = req.body;

    const mentalMap = new MentalMap({
      userId: req.user.userId,
      name,
      description,
      theme: theme || 'dark',
      isPublic: isPublic || false,
      cards: [],
      connections: []
    });

    await mentalMap.save();

    res.status(201).json({
      success: true,
      message: 'Mapa mental criado com sucesso',
      mentalMap
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao criar mapa mental',
      error: error.message
    });
  }
});

// @route   GET /api/mentalmap
// @desc    Obter todos os mapas mentais do usuário
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const mentalMaps = await MentalMap.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .select('-cards -connections'); // Não retorna cards/connections na lista

    res.status(200).json({
      success: true,
      count: mentalMaps.length,
      mentalMaps
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao obter mapas mentais',
      error: error.message
    });
  }
});

// @route   GET /api/mentalmap/:id
// @desc    Obter um mapa mental específico
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const mentalMap = await MentalMap.findById(req.params.id);

    if (!mentalMap) {
      return res.status(404).json({
        success: false,
        message: 'Mapa mental não encontrado'
      });
    }

    // Verificar se o usuário é o proprietário
    if (mentalMap.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Não autorizado a acessar este mapa'
      });
    }

    res.status(200).json({
      success: true,
      mentalMap
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao obter mapa mental',
      error: error.message
    });
  }
});

// @route   PUT /api/mentalmap/:id
// @desc    Atualizar mapa mental
// @access  Private
router.put('/:id', protect, validateMentalMap, handleValidationErrors, async (req, res) => {
  try {
    let mentalMap = await MentalMap.findById(req.params.id);

    if (!mentalMap) {
      return res.status(404).json({
        success: false,
        message: 'Mapa mental não encontrado'
      });
    }

    // Verificar se o usuário é o proprietário
    if (mentalMap.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Não autorizado a atualizar este mapa'
      });
    }

    // Atualizar campos
    mentalMap = await MentalMap.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Mapa mental atualizado com sucesso',
      mentalMap
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar mapa mental',
      error: error.message
    });
  }
});

// @route   POST /api/mentalmap/:id/cards
// @desc    Adicionar card ao mapa mental
// @access  Private
router.post('/:id/cards', protect, validateCard, handleValidationErrors, async (req, res) => {
  try {
    const mentalMap = await MentalMap.findById(req.params.id);

    if (!mentalMap) {
      return res.status(404).json({
        success: false,
        message: 'Mapa mental não encontrado'
      });
    }

    // Verificar se o usuário é o proprietário
    if (mentalMap.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Não autorizado a modificar este mapa'
      });
    }

    const { type, title, content, url, description, imageSrc, x, y, color } = req.body;

    const newCard = {
      id: Date.now().toString(),
      type,
      title,
      content,
      url,
      description,
      imageSrc,
      x,
      y,
      color
    };

    mentalMap.cards.push(newCard);
    mentalMap.updatedAt = Date.now();
    await mentalMap.save();

    res.status(201).json({
      success: true,
      message: 'Card adicionado com sucesso',
      card: newCard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao adicionar card',
      error: error.message
    });
  }
});

// @route   DELETE /api/mentalmap/:id
// @desc    Deletar mapa mental
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const mentalMap = await MentalMap.findById(req.params.id);

    if (!mentalMap) {
      return res.status(404).json({
        success: false,
        message: 'Mapa mental não encontrado'
      });
    }

    // Verificar se o usuário é o proprietário
    if (mentalMap.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Não autorizado a deletar este mapa'
      });
    }

    await MentalMap.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Mapa mental deletado com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar mapa mental',
      error: error.message
    });
  }
});

module.exports = router;
