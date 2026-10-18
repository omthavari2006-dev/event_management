const notificationService = require('../services/notificationService');
const asyncHandler = require('../utils/asyncHandler');

const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationService.getMyNotifications(req.user.id);
  res.status(200).json({ success: true, count: notifications.length, notifications });
});

const markAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const result = await notificationService.markAsRead(notificationId, req.user.id);
  res.status(200).json({ success: true, result });
});

const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user.id);
  res.status(200).json({ success: true, ...result });
});

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead
};
