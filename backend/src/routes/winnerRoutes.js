const express = require('express');
const router = express.Router();
const winnerController = require('../controllers/winnerController');
const { authenticate } = require('../middleware/auth');
const { requireEventOrganizer } = require('../middleware/roles');

router.post('/event/:eventId', authenticate, requireEventOrganizer, winnerController.declareWinners);
router.get('/event/:eventId', winnerController.getWinners);

module.exports = router;
