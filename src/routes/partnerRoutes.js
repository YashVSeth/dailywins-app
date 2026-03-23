const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partnerController');

router.get('/', partnerController.getAllPartners);
router.post('/register', partnerController.registerPartner);
router.post('/login', partnerController.loginPartner);
router.patch('/:id/status', partnerController.updateStatus);
router.delete('/:id', partnerController.deletePartner);

module.exports = router;
