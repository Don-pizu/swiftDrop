//models/notification.js
//schema for creating notofocations and sending

const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  	user: { 
  		type: mongoose.Schema.Types.ObjectId, 
  		ref: 'User', 
  		required: true 
  	},
  	channel: { 
  		type: String, 
  		enum: ['sms','whatsapp','email','push','in_app'], 
  		required: true 
  	},
  	type: {                     // e.g. driver_arrived, trip_completed, payment_receipt
  		type: String, 
  		required: true 
  	}, 
  	title: {
  		type: String,
  	},
  	body: {
  		type: String,
  	},
  	payload: mongoose.Mixed,                  // stores all extra data (ride ID, message, etc.)
  	status: { 
  		type: String, 
  		enum: ['pending','processing','sent','delivered','failed','cancelled'], 
  		default: 'pending' 
  	},
  	jobId: {
  		type: String,
  	},
  	error: {
  		type: String,
  	},
  	read: { 
  		type: Boolean, 
  		default: false 
  	},
  	sentAt: {
  		type: Date,
  	},
  	deliveredAt: {
  		type: Date,
  	}
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
