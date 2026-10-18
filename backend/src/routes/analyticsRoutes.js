const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roles');

router.get('/admin', authenticate, requireAdmin, analyticsController.getAdminAnalytics);
router.get('/leaderboard', analyticsController.getLeaderboard);

module.exports = router;
