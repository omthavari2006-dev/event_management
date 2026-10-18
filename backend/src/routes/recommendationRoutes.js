const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { requireStudent } = require('../middleware/roles');

router.get('/events', authenticate, requireStudent, recommendationController.getRecommendations);
router.get('/friends-going/:eventId', authenticate, requireStudent, recommendationController.getFriendsGoing);
router.get('/degrees-of-connection', optionalAuth, recommendationController.getDegreesOfConnection);
router.get('/teammates/:eventId', authenticate, requireStudent, recommendationController.getTeammateSuggestions);

module.exports = router;
