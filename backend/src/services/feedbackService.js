const feedbackRepository = require('../repositories/feedbackRepository');

class FeedbackService {
  async submitFeedback({ studentId, eventId, rating, comment }) {
    if (!rating || rating < 1 || rating > 5) {
      throw new Error('Rating must be an integer between 1 and 5.');
    }
    return feedbackRepository.submitFeedback({ studentId, eventId, rating, comment });
  }

  async getFeedback(eventId) {
    return feedbackRepository.getEventFeedback(eventId);
  }
}

module.exports = new FeedbackService();
