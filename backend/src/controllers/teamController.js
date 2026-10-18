const teamService = require('../services/teamService');
const asyncHandler = require('../utils/asyncHandler');

const createTeam = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { teamName } = req.body;
  if (!teamName) {
    return res.status(400).json({ success: false, message: 'teamName is required.' });
  }
  const result = await teamService.createTeam({
    studentId: req.user.id,
    eventId,
    teamName
  });
  res.status(201).json({ success: true, result, message: 'Team created successfully.' });
});

const addMember = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const { memberStudentId } = req.body;
  if (!memberStudentId) {
    return res.status(400).json({ success: false, message: 'memberStudentId is required.' });
  }
  const result = await teamService.addMember({
    teamId,
    leaderId: req.user.id,
    memberStudentId
  });
  res.status(200).json({ success: true, result, message: 'Member added to team.' });
});

const getTeams = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const teams = await teamService.getTeamsByEvent(eventId);
  res.status(200).json({ success: true, teams });
});

module.exports = {
  createTeam,
  addMember,
  getTeams
};
