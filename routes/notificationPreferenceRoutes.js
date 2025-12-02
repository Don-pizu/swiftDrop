// routes/notificationPreferenceRoutes.js

const express = require('express');
const router = express.Router();
const { getPreferences, updatePreferences, resetPreferences } = require('../controllers/notificationPreferenceController');
const { protect, protectRoles } = require('../middleware/authMiddleware');  


/**
 * @swagger
 * tags:
 *   name: Notification Preference
 *   description: Notification Preference management
 */

/**
 * @swagger
 * /notification/preferences:
 *   get:
 *     summary: Get logged-in user's notification preferences
 *     tags: [Notification Preferences]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User preferences retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationPreference'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */



/**
 * @swagger
 * /notification/preferences:
 *   put:
 *     summary: Update user notification preferences
 *     tags: [Notification Preferences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               channels:
 *                 type: object
 *                 properties:
 *                   sms:
 *                     type: boolean
 *                   whatsapp:
 *                     type: boolean
 *                   email:
 *                     type: boolean
 *                   push:
 *                     type: boolean
 *                   in_app:
 *                     type: boolean
 *               doNotDisturb:
 *                 type: object
 *                 properties:
 *                   startHour:
 *                     type: number
 *                   endHour:
 *                     type: number
 *               locale:
 *                 type: string
 *                 example: "en"
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Preferences updated successfully
 *                 prefs:
 *                   $ref: '#/components/schemas/NotificationPreference'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */




/**
 * @swagger
 * /notification/preferences:
 *   delete:
 *     summary: Reset user preferences to default settings
 *     tags: [Notification Preferences]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Preferences reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Preferences reset to default
 *                 prefs:
 *                   $ref: '#/components/schemas/NotificationPreference'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */



router.route('/notification/preferences')
  .get(protect, getPreferences)
  .put(protect, updatePreferences)
  .delete(protect, resetPreferences);

module.exports = router;
