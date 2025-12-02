//routes/walletRoutes.js

const express = require('express');
const router = express.Router();
const { protect, protectRoles } = require('../middleware/authMiddleware');
const { getWallet, fundWallet, withdrawWallet, deleteWallet } = require('../controllers/walletController');

/**
 * @swagger
 * tags:
 *   name: Wallet
 *   description: Wallet management
 */

/**
 * @swagger
 * /wallets:
 *   get:
 *     summary: Get logged-in user's wallet
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User wallet retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Wallet'
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /wallets/fund:
 *   post:
 *     summary: Fund user's wallet
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 2000
 *               reference:
 *                 type: string
 *                 example: "PSK-88288HSJHD"
 *               description:
 *                 type: string
 *                 example: "Wallet topup"
 *     responses:
 *       200:
 *         description: Wallet funded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 wallet:
 *                   $ref: '#/components/schemas/Wallet'
 *       400:
 *         description: Invalid amount
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /wallets/withdraw:
 *   post:
 *     summary: Withdraw funds from wallet (Driver earnings)
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 1500
 *               description:
 *                 type: string
 *                 example: "Driver withdrawal"
 *     responses:
 *       200:
 *         description: Withdrawal successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 wallet:
 *                   $ref: '#/components/schemas/Wallet'
 *       400:
 *         description: Insufficient funds or invalid amount
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /wallets/{id}:
 *   delete:
 *     summary: Delete a wallet (Admin only)
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Wallet ID
 *     responses:
 *       200:
 *         description: Wallet deleted successfully
 *       404:
 *         description: Wallet not found
 *       500:
 *         description: Internal server error
 */


router.get('/wallets', protect, getWallet);
router.post('/wallets/fund', protect, fundWallet);
router.post('/wallets/withdraw', protect, withdrawWallet);
router.delete('/wallets/:id', protect, protectRoles('admin'), deleteWallet);

module.exports = router;
