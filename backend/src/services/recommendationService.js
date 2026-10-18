const analyticsRepository = require('../repositories/analyticsRepository');

class RecommendationService {
  async getRecommendations(studentId) {
    return analyticsRepository.getEventRecommendations(studentId);
  }

  async getFriendsGoing(studentId, eventId) {
    return analyticsRepository.getFriendsGoing(studentId, eventId);
  }

  async getDegreesOfConnection(studentId1, studentId2) {
    return analyticsRepository.getDegreesOfConnection(studentId1, studentId2);
  }

  async getTeammateSuggestions(studentId, eventId) {
    return analyticsRepository.getTeammateSuggestions(studentId, eventId);
  }

  async getLeaderboard() {
    return analyticsRepository.getLeaderboard();
  }

  async getAdminStats() {
    const [stats, topStudents, attendanceRates, topClubs, noShows, deptRanking, clubInfluence] = await Promise.all([
      analyticsRepository.getAdminStats(),
      analyticsRepository.getTopActiveStudents(5),
      analyticsRepository.getAttendanceRates(),
      analyticsRepository.getTopRatedClubs(),
      analyticsRepository.getNoShowStudents(),
      analyticsRepository.getDepartmentRanking(),
      analyticsRepository.getClubInfluence()
    ]);

    return {
      overview: stats,
      topStudents,
      attendanceRates,
      topClubs,
      noShows,
      deptRanking,
      clubInfluence
    };
  }
}

module.exports = new RecommendationService();
