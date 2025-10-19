//routes/notificationRoutes


const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  resendNotification,
  sendBroadcast
} = require('../controllers/notificationController');

const { protect, protectRoles } = require('../middleware/authMiddleware');

// ADMIN ROUTES
router.post('/notifications/broadcast', protect, protectRoles('admin'), sendBroadcast);
router.post('/notifications/resend/:id', protect, protectRoles('admin'), resendNotification);


// USER ROUTES
router.get('/notifications', protect, getUserNotifications);
router.put('/notifications/:id/read', protect, markAsRead);
router.put('/notifications/mark-all-read', protect, markAllAsRead);
router.delete('/notifications/:id', protect, deleteNotification);


module.exports = router;
