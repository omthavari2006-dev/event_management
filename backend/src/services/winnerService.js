const winnerRepository = require('../repositories/winnerRepository');

class WinnerService {
  async declareWinners(eventId, winners) {
    return winnerRepository.declareWinners(eventId, winners);
  }

  async getWinners(eventId) {
    return winnerRepository.getEventWinners(eventId);
  }
}

module.exports = new WinnerService();
