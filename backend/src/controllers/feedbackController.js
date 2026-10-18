const feedbackService = require('../services/feedbackService');
const asyncHandler = require('../utils/asyncHandler');

const submitFeedback = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { rating, comment } = req.body;
  const result = await feedbackService.submitFeedback({
    studentId: req.user.id,
    eventId,
    rating,
    comment
  });
  res.status(200).json({ success: true, result, message: 'Feedback submitted successfully.' });
});

const getFeedback = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const feedback = await feedbackService.getFeedback(eventId);
  res.status(200).json({ success: true, count: feedback.length, feedback });
});

module.exports = {
  submitFeedback,
  getFeedback
};
