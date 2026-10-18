const teamRepository = require('../repositories/teamRepository');

class TeamService {
  async createTeam({ studentId, eventId, teamName }) {
    return teamRepository.createTeam({ studentId, eventId, teamName });
  }

  async addMember({ teamId, leaderId, memberStudentId }) {
    return teamRepository.addTeamMember({ teamId, leaderId, memberStudentId });
  }

  async getTeamsByEvent(eventId) {
    return teamRepository.getTeamsByEvent(eventId);
  }
}

module.exports = new TeamService();
