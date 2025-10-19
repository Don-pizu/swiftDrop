//routes/walletRoutes.js

const express = require('express');
const router = express.Router();
const { protect, protectRoles } = require('../middleware/authMiddleware');
const { getWallet, fundWallet, withdrawWallet, deleteWallet } = require('../controllers/walletController');


router.get('/wallets', protect, getWallet);
router.post('/wallets/fund', protect, fundWallet);
router.post('/wallets/withdraw', protect, withdrawWallet);
router.delete('/wallets/:id', protect, protectRoles('admin'), deleteWallet);

module.exports = router;
