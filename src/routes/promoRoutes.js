const express = require('express');
const router = express.Router();
const promoController = require('../controllers/promoController');

router.get('/', promoController.getAllPromos);
router.post('/create', promoController.createPromo);
router.patch('/:id/status', promoController.updateStatus);
router.delete('/:id', promoController.deletePromo);

module.exports = router;
