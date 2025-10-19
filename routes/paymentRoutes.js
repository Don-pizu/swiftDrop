//routes/paymentRoutes.js

const express = require('express');
const router = express.Router();
const { protect, protectRoles } = require('../middleware/authMiddleware');
const { payForRide, confirmCashPayment, verifyPaystackPayment, paystackWebhook } = require('../controllers/paymentController');

// Pay for a specific ride
router.post('/ride/payment/:id', protect, payForRide);
router.put('/ride/:id/confirm-cash', protect, protectRoles('rider',	'driver', 'admin'), confirmCashPayment);
router.post('/payment/verify', protect, verifyPaystackPayment);
router.post('/payment/webhook', paystackWebhook);

module.exports = router;
