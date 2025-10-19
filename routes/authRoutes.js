// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const { register, verifyOtp, resendOtp, login, getAllUsers, getUserProfile, forgotPassword, resetPassword, updateUser, updateAdmin } = require('../controllers/authController.js');
const { protect, protectRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

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