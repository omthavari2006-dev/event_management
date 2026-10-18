const recommendationService = require('../services/recommendationService');
const asyncHandler = require('../utils/asyncHandler');

const getRecommendations = asyncHandler(async (req, res) => {
  const recommendations = await recommendationService.getRecommendations(req.user.id);
  res.status(200).json({ success: true, count: recommendations.length, recommendations });
});

const getFriendsGoing = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const friends = await recommendationService.getFriendsGoing(req.user.id, eventId);
  res.status(200).json({ success: true, count: friends.length, friends });
});

const getDegreesOfConnection = asyncHandler(async (req, res) => {
  const { studentId1, studentId2 } = req.query;
  const s1 = studentId1 || (req.user ? req.user.id : 'stud-001');
  const s2 = studentId2 || 'stud-003';
  const connection = await recommendationService.getDegreesOfConnection(s1, s2);
  res.status(200).json({ success: true, connection });
});

const getTeammateSuggestions = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const suggestions = await recommendationService.getTeammateSuggestions(req.user.id, eventId);
  res.status(200).json({ success: true, suggestions });
});

module.exports = {
  getRecommendations,
  getFriendsGoing,
  getDegreesOfConnection,
  getTeammateSuggestions
};
