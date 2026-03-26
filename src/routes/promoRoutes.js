const express = require('express');
const router = express.Router();
const promoController = require('../controllers/promoController');
const { requireAdmin } = require('../middleware/authMiddleware');

router.get('/', requireAdmin, promoController.getAllPromos);
router.post('/create', requireAdmin, promoController.createPromo);
router.patch('/:id/status', requireAdmin, promoController.updateStatus);
router.delete('/:id', requireAdmin, promoController.deletePromo);

module.exports = router;
