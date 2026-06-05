/**
 * Site Preview Routes
 * Endpoints for fetching site metadata and previews
 */

const express = require('express');
const { query, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { getSitePreview } = require('../utils/sitePreview');

const router = express.Router();

/**
 * GET /api/preview
 * Fetch site preview metadata
 * Query: url (required) - URL to fetch
 */
router.get(
  '/',
  auth,
  query('url')
    .notEmpty().withMessage('URL é obrigatória')
    .isURL().withMessage('URL inválida'),
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { url } = req.query;

      // Get site preview
      const preview = await getSitePreview(url);

      if (!preview.success) {
        return res.status(400).json({
          success: false,
          message: preview.error
        });
      }

      res.json({
        success: true,
        data: preview.data
      });
    } catch (error) {
      console.error('Preview error:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar preview'
      });
    }
  }
);

module.exports = router;
