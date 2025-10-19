//models/wallet.js

const mongoose = require('mongoose');

// Wallet Schema handles all user/driver balances and transaction history
const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  balance: {
    type: Number,
    default: 0 // ₦0 by default
  },
  transactions: [
    {
      type: {
        type: String,
        enum: ['credit', 'debit'],
        required: true
      },
      amount: {
        type: Number,
        required: true
      },
      reference: {
        type: String           // e.g. Paystack ref or custom UUID
      },
      description: {
        type: String           // e.g. “Ride payment”, “Driver earning”, etc.
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Wallet', walletSchema);
