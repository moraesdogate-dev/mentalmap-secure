const { body, validationResult, param } = require('express-validator');

// Middleware para tratar erros de validação
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// Validações para registro
exports.validateRegister = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Nome de usuário deve ter entre 3 e 30 caracteres')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Nome de usuário pode conter apenas letras, números, _ e -')
    .escape(),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter no mínimo 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter letras maiúsculas, minúsculas e números'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Senhas não coincidem')
];

// Validações para login
exports.validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória')
];

// Validações para criar mapa mental
exports.validateMentalMap = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Nome do mapa deve ter entre 1 e 100 caracteres')
    .escape(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Descrição deve ter no máximo 500 caracteres')
    .escape(),
  body('theme')
    .optional()
    .isIn(['dark', 'light', 'neon', 'cyberpunk'])
    .withMessage('Tema inválido'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic deve ser booleano')
];

// Validações para cards
exports.validateCard = [
  body('type')
    .isIn(['text', 'link', 'image'])
    .withMessage('Tipo de card inválido'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Título deve ter no máximo 200 caracteres')
    .escape(),
  body('content')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Conteúdo deve ter no máximo 1000 caracteres')
    .escape(),
  body('url')
    .optional()
    .isURL()
    .withMessage('URL inválida'),
  body('x')
    .isInt()
    .withMessage('X deve ser um número inteiro'),
  body('y')
    .isInt()
    .withMessage('Y deve ser um número inteiro')
];

// Sanitização geral para prevenir XSS
exports.sanitizeInput = (req, res, next) => {
  // Sanitizar todos os campos do body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        // Remove caracteres perigosos
        req.body[key] = req.body[key]
          .replace(/[<>]/g, '')
          .trim();
      }
    });
  }
  next();
};
