const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challengeController');

router.get('/', challengeController.getAllChallenges);
router.post('/register', challengeController.createChallenge);
router.delete('/:id', challengeController.deleteChallenge);

module.exports = router;
