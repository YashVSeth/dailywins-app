const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

const { requireAdmin } = require('../middleware/authMiddleware');

router.post('/login', adminController.loginAdmin);
router.patch('/password', requireAdmin, adminController.updatePassword);

module.exports = router;
