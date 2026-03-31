const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partnerController');
const { requireAdmin, requirePartner } = require('../middleware/authMiddleware');

router.get('/', requireAdmin, partnerController.getAllPartners);
router.post('/register', requireAdmin, partnerController.registerPartner);
router.post('/login', partnerController.loginPartner);
router.get('/:id/stats', requirePartner, partnerController.getPartnerStats); // For partners
router.get('/:id/analytics', requireAdmin, partnerController.getPartnerStats); // For admins
router.patch('/:id/status', requireAdmin, partnerController.updateStatus);
router.delete('/:id', requireAdmin, partnerController.deletePartner);

module.exports = router;
