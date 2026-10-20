const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');

const GMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;

const register = asyncHandler(async (req, res) => {
  const { name, email, phone, department, year, password, role, clubId, clubName, title } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  if (!GMAIL_REGEX.test(cleanEmail)) {
    return res.status(400).json({
      success: false,
      message: 'Email must be a valid @gmail.com address (e.g., yourname@gmail.com).'
    });
  }

  let result;
  if (role === 'Admin') {
    result = await authService.registerAdmin({
      name,
      email: cleanEmail,
      title: title || department || 'Campus Administrator',
      password
    });
  } else if (role === 'Organizer') {
    result = await authService.registerOrganizer({
      name,
      email: cleanEmail,
      phone,
      department: department || 'Engineering',
      year: year ? parseInt(year) : 3,
      password,
      clubId,
      clubName
    });
  } else {
    result = await authService.registerStudent({
      name,
      email: cleanEmail,
      phone,
      department: department || 'Computer Science',
      year: year ? parseInt(year) : 1,
      password
    });
  }

  res.status(201).json({ success: true, ...result });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required.' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  if (!GMAIL_REGEX.test(cleanEmail)) {
    return res.status(400).json({
      success: false,
      message: 'Email must be a valid @gmail.com address (e.g., student@gmail.com).'
    });
  }

  const result = await authService.login(cleanEmail, password);
  res.status(200).json({ success: true, ...result });
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id, req.user.role);
  res.status(200).json({ success: true, user });
});

module.exports = {
  register,
  login,
  me
};
