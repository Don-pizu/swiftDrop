//models/ride.js
//schema for the actual ride booking

const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
	user: { 
	  	type: mongoose.Schema.Types.ObjectId, 
	  	ref: 'User',          // Users with role 'user'
	},
	rider: { 
	  	type: mongoose.Schema.Types.ObjectId, 
	  	ref: 'User',          // Users with role 'rider'
	},
  	driver: { 
  		type: mongoose.Schema.Types.ObjectId, 
  		ref: 'User',          // Users with role 'driver'
  	},
  	serviceType: {
  		type: String,
  		enum: ['passenger', 'delivery'],
  		default: 'delivery'
  	},
  	pickupLocation: {                           //pick-up location
    	type: { 
    		type: String, 
    		enum: ['Point'], 
    		default: 'Point' 
    	},
    	coordinates: { 
    		type: [Number], 
    		required: true 
    	}
  	},
  	dropoffLocation: {                        //drop-off location
    	type: { 
    		type: String, 
    		enum: ['Point'], 
    		default: 'Point' 
    	},
    	coordinates: { 
    		type: [Number], 
    		required: true 
    	}
  	},
  	status: {
    	type: String,
    	enum: ['requested','assigned','accepted','rider_arrived', 'driver_arrived','in_progress','completed','cancelled','timeout', 'ride-uncompleted'],
    	default: 'requested'
  	},
  	fare: {
  		type: Number,
  		default: 0
  	},
  	baseFare: { type: Number, default: 0 },        // Base fee
	distanceFare: { type: Number, default: 0 },    // Calculated by km/mile
	surgeMultiplier: { type: Number, default: 1 }, // Surge pricing factor
  	
	// 💳 Payment section
	paymentMethod: {
	    type: String,
	    enum: ['wallet', 'card', 'cash'],
	    default: 'wallet'
	},
	paymentStatus: {
	    type: String,
	    enum: ['pending', 'paid', 'failed', 'refunded', 'initialized'],
	    default: 'pending'
	},
	paymentReference: {
	  type: String,
	  index: true,                        // helps faster lookup
	},

  	requestedAt: { 
  		type: Date, 
  		default: Date.now 
  	},
  	expiresAt: Date, 				// optional (for request expiry)
}, { timestamps: true });

rideSchema.index({ pickupLocation: '2dsphere' });

module.exports = mongoose.model('Ride', rideSchema);