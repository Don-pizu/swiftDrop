//models/notificationPreference.js

//schema for selecting notification channel to pick

const mongoose = require('mongoose');

const PreferenceSchema = new mongoose.Schema({

  	user: { 
  		type: mongoose.Schema.Types.ObjectId, 
  		ref: 'User', 
  		unique: true,
  		required: true 
  	},
  	channels: {
    	sms: { type: Boolean, default: true },
    	whatsapp: { type: Boolean, default: true },
    	email: { type: Boolean, default: true },
    	push: { type: Boolean, default: true },
    	in_app: { type: Boolean, default: true },
  	},
  	doNotDisturb: {                    // 0-23
  		startHour: Number, 
  		endHour: Number 
  	}, 
  	locale: {                          //preferred language or regional setting
  		type: String, 
  		default: 'en' 
  	}
}, { timestamps: true });

module.exports = mongoose.model('NotificationPreference', PreferenceSchema);
