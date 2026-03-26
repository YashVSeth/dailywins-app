const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { requireAdmin } = require('../middleware/authMiddleware');

router.get('/', requireAdmin, statsController.getStats);
router.get('/report', requireAdmin, statsController.generateReport);

module.exports = router;
