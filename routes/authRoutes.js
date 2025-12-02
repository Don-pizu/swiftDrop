// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const { register, verifyOtp, resendOtp, login, getAllUsers, getUserProfile, forgotPassword, resetPassword, updateUser, updateAdmin } = require('../controllers/authController.js');
const { protect, protectRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');



/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and User Management
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullname
 *               - email
 *               - phoneNumber
 *               - location
 *               - password
 *               - confirmPassword
 *             properties:
 *               fullname:
 *                 type: string
 *               email:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *                 example: "+2348012345678"
 *               location:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, rider, driver, admin]
 *     responses:
 *       201:
 *         description: Registration successful, OTP sent
 *       400:
 *         description: Validation or duplication error
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /auth/verifyOtp:
 *   post:
 *     summary: Verify user account using OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Account verified successfully
 *       400:
 *         description: Invalid or expired OTP
 */


/**
 * @swagger
 * /auth/resendOtp:
 *   post:
 *     summary: Resend OTP via email or phone (SMS/WhatsApp)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *                 description: Email address (required if using email)
 *               phoneNumber:
 *                 type: string
 *                 example: "+2348012345678"
 *                 description: Phone number in international format
 *               channel:
 *                 type: string
 *                 enum: [sms, whatsapp]
 *                 default: sms
 *                 description: Channel for sending OTP if phoneNumber is used
 *             oneOf:
 *               - required: ["email"]
 *               - required: ["phoneNumber"]
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *       400:
 *         description: Missing field or already verified
 *       500:
 *         description: Internal server error
 */



/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials or unverified user
 */

/**
 * @swagger
 * /auth/forgotPassword:
 *   post:
 *     summary: Request a password reset link via email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset link sent successfully
 *       400:
 *         description: User not found
 */

/**
 * @swagger
 * /auth/reset-password/{token}:
 *   post:
 *     summary: Reset user password
 *     tags: [Auth]
 *     parameters:
 *       - name: token
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password, confirmPassword]
 *             properties:
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get logged-in user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns user profile
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /auth/update:
 *   put:
 *     summary: Update user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fullname:
 *                 type: string
 *               email:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               location:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /auth/admin:
 *   put:
 *     summary: Update admin profile or role
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fullname:
 *                 type: string
 *               email:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               location:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, rider, driver, admin]
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Admin updated successfully
 */

/**
 * @swagger
 * /auth/allusers:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns paginated list of users
 *       401:
 *         description: Unauthorized
 */



router.post('/register', register);
router.post("/verifyOtp", verifyOtp);
router.post("/resendOtp", resendOtp);
router.post('/forgotPassword', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/login', login);
router.get('/allusers', protect, protectRoles('admin'), getAllUsers);
router.get('/me',protect, getUserProfile)
router.put('/update', protect, upload.single('image'), updateUser );
router.put('/admin', protect, protectRoles('admin'), upload.single('image'), updateAdmin);

module.exports = router;