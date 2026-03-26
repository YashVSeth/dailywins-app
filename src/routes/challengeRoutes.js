const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challengeController');
const { requireAdmin } = require('../middleware/authMiddleware');

router.get('/', requireAdmin, challengeController.getAllChallenges);
router.post('/register', requireAdmin, challengeController.createChallenge);
router.delete('/:id', requireAdmin, challengeController.deleteChallenge);

module.exports = router;
