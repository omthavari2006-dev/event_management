const clubRepository = require('../repositories/clubRepository');
const { v4: uuidv4 } = require('uuid');

class ClubService {
  async getAllClubs(status) {
    return clubRepository.getAllClubs(status);
  }

  async getClub(clubId) {
    const club = await clubRepository.getClubById(clubId);
    if (!club) {
      throw new Error('Club not found.');
    }
    return club;
  }

  async requestClub({ name, description, facultyAdvisor, studentId }) {
    const clubId = `club-${uuidv4().substring(0, 6)}`;
    return clubRepository.requestClub({
      clubId,
      name,
      description,
      facultyAdvisor,
      studentId
    });
  }

  async approveClub(clubId, adminId) {
    return clubRepository.approveClub(clubId, adminId);
  }

  async addMember({ clubId, studentId, role }) {
    return clubRepository.addMember({ clubId, studentId, role });
  }
}

module.exports = new ClubService();
