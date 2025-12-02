//routes/paymentRoutes.js

const express = require('express');
const router = express.Router();
const { protect, protectRoles } = require('../middleware/authMiddleware');
const { payForRide, confirmCashPayment, verifyPaystackPayment, paystackWebhook } = require('../controllers/paymentController');


/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Ride Payment management
 */

/**
 * @swagger
 * /ride/payment/{id}:
 *   post:
 *     tags:
 *       - Payment
 *     summary: Process ride payment (wallet, cash, card)
 *     description: >
 *       Handles all payment types for a ride (wallet, cash, card).  
 *       Card payments initialize a Paystack transaction.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Ride ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentMethod:
 *                 type: string
 *                 enum: [wallet, cash, card]
 *                 example: wallet
 *     responses:
 *       200:
 *         description: Payment processed successfully
 *       400:
 *         description: Invalid request or ride already paid
 *       404:
 *         description: Ride not found
 *       500:
 *         description: Server error
 */


/**
 * @swagger
 * /ride/{id}/confirm-cash:
 *   put:
 *     tags:
 *       - Payment
 *     summary: Confirm cash payment for a ride
 *     description: >
 *       Admin/driver/rider manually mark a cash ride as paid  
 *       and automatically trigger revenue split + notification.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Ride ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cash payment confirmed
 *       400:
 *         description: Ride already paid or not a cash ride
 *       404:
 *         description: Ride not found
 *       500:
 *         description: Server error
 */


/**
 * @swagger
 * /payment/verify:
 *   post:
 *     tags:
 *       - Payment
 *     summary: Verify Paystack payment
 *     description: >
 *       Verifies a Paystack transaction using the reference  
 *       returned after card initialization.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reference:
 *                 type: string
 *                 example: ps_ref_83479238
 *     responses:
 *       200:
 *         description: Payment verified & revenue distributed
 *       400:
 *         description: Payment not successful or invalid reference
 *       404:
 *         description: Ride not found for reference
 *       500:
 *         description: Server error
 */



/**
 * @swagger
 * /payment/webhook:
 *   post:
 *     tags:
 *       - Payment
 *     summary: Paystack webhook handler
 *     description: >
 *       Endpoint to receive Paystack events (charge.success).  
 *       Auto-validates signature and distributes revenue if successful.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         description: Invalid signature
 *       500:
 *         description: Server error
 */



// Pay for a specific ride
router.post('/ride/payment/:id', protect, payForRide);
router.put('/ride/:id/confirm-cash', protect, protectRoles('rider',	'driver', 'admin'), confirmCashPayment);
router.post('/payment/verify', protect, verifyPaystackPayment);
router.post('/payment/webhook', paystackWebhook);

module.exports = router;
