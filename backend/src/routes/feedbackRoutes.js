const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { authenticate } = require('../middleware/auth');
const { requireStudent } = require('../middleware/roles');

router.post('/event/:eventId', authenticate, requireStudent, feedbackController.submitFeedback);
router.get('/event/:eventId', feedbackController.getFeedback);

module.exports = router;
