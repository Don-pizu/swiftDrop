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


/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         user:
 *           type: string
 *           description: User ID receiving the notification
 *         channel:
 *           type: string
 *           enum: [sms, whatsapp, email, push, in_app]
 *         type:
 *           type: string
 *           description: The notification event type
 *         title:
 *           type: string
 *         body:
 *           type: string
 *         payload:
 *           type: object
 *         status:
 *           type: string
 *           enum: [pending, processing, sent, delivered, failed, cancelled]
 *         jobId:
 *           type: string
 *         error:
 *           type: string
 *         read:
 *           type: boolean
 *         sentAt:
 *           type: string
 *           format: date-time
 *         deliveredAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: User and admin notification management
 */


/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get all notifications for the logged-in user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       404:
 *         description: No notifications found
 */


/**
 * @swagger
 * /notifications/{id}/read:
 *   put:
 *     summary: Mark a specific notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       404:
 *         description: Notification not found
 */


/**
 * @swagger
 * /notifications/mark-all-read:
 *   put:
 *     summary: Mark all notifications for the user as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */


/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification deleted
 *       404:
 *         description: Notification not found
 */


/**
 * @swagger
 * /notifications/broadcast:
 *   post:
 *     summary: Admin – Broadcast a message to all users
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               body:
 *                 type: string
 *             required: [title, body]
 *     responses:
 *       200:
 *         description: Broadcast queued successfully
 */


/**
 * @swagger
 * /notifications/resend/{id}:
 *   post:
 *     summary: Admin – Manually resend a specific notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification re-queued
 *       404:
 *         description: Notification not found
 */




// ADMIN ROUTES
router.post('/notifications/broadcast', protect, protectRoles('admin'), sendBroadcast);
router.post('/notifications/resend/:id', protect, protectRoles('admin'), resendNotification);


// USER ROUTES
router.get('/notifications', protect, getUserNotifications);
router.put('/notifications/:id/read', protect, markAsRead);
router.put('/notifications/mark-all-read', protect, markAllAsRead);
router.delete('/notifications/:id', protect, deleteNotification);


module.exports = router;
