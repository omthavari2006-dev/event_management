const recommendationService = require('../services/recommendationService');
const asyncHandler = require('../utils/asyncHandler');

const getAdminAnalytics = asyncHandler(async (req, res) => {
  const data = await recommendationService.getAdminStats();
  res.status(200).json({ success: true, analytics: data });
});

const getLeaderboard = asyncHandler(async (req, res) => {
  const leaderboard = await recommendationService.getLeaderboard();
  res.status(200).json({ success: true, count: leaderboard.length, leaderboard });
});

module.exports = {
  getAdminAnalytics,
  getLeaderboard
};
