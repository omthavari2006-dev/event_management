const winnerService = require('../services/winnerService');
const asyncHandler = require('../utils/asyncHandler');

const declareWinners = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { winners } = req.body;
  if (!winners || !Array.isArray(winners)) {
    return res.status(400).json({ success: false, message: 'winners must be an array.' });
  }
  const result = await winnerService.declareWinners(eventId, winners);
  res.status(200).json({ success: true, count: result.length, winners: result, message: 'Winners declared successfully.' });
});

const getWinners = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const winners = await winnerService.getWinners(eventId);
  res.status(200).json({ success: true, count: winners.length, winners });
});

module.exports = {
  declareWinners,
  getWinners
};
