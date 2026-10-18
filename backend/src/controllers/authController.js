const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const { name, email, phone, department, year, password } = req.body;
  if (!name || !email || !password || !department) {
    return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
  }
  const result = await authService.registerStudent({ name, email, phone, department, year, password });
  res.status(201).json({ success: true, ...result });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required.' });
  }
  const result = await authService.login(email, password);
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
