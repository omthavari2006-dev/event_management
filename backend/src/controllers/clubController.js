const clubService = require('../services/clubService');
const asyncHandler = require('../utils/asyncHandler');

const getClubs = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const clubs = await clubService.getAllClubs(status);
  res.status(200).json({ success: true, clubs });
});

const getClub = asyncHandler(async (req, res) => {
  const { clubId } = req.params;
  const club = await clubService.getClub(clubId);
  res.status(200).json({ success: true, club });
});

const requestClub = asyncHandler(async (req, res) => {
  const { name, description, facultyAdvisor } = req.body;
  if (!name || !facultyAdvisor) {
    return res.status(400).json({ success: false, message: 'Name and Faculty Advisor are required.' });
  }
  const club = await clubService.requestClub({
    name,
    description,
    facultyAdvisor,
    studentId: req.user.id
  });
  res.status(201).json({ success: true, club, message: 'Club creation request submitted for Admin approval.' });
});

const approveClub = asyncHandler(async (req, res) => {
  const { clubId } = req.params;
  const result = await clubService.approveClub(clubId, req.user.id);
  res.status(200).json({ success: true, result, message: 'Club approved successfully.' });
});

const addMember = asyncHandler(async (req, res) => {
  const { clubId } = req.params;
  const { studentId, role } = req.body;
  const result = await clubService.addMember({ clubId, studentId, role });
  res.status(200).json({ success: true, result, message: 'Member added/updated in club.' });
});

module.exports = {
  getClubs,
  getClub,
  requestClub,
  approveClub,
  addMember
};
