const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');
const { requireStudent } = require('../middleware/roles');

router.get('/my', authenticate, requireStudent, notificationController.getMyNotifications);
router.put('/:notificationId/read', authenticate, requireStudent, notificationController.markAsRead);
router.put('/read-all', authenticate, requireStudent, notificationController.markAllAsRead);

module.exports = router;
