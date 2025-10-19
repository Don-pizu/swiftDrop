//models/driver.js
//schema for the rider and driver that want to convey products/passenger

const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({

  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true // one driver profile per user  
  },
  status: { 
    type: String, 
    enum: ['available', 'on-trip', 'offline'], 
    default: 'offline' 
  },
  rating: { 
    type: Number, 
    default: 2.5 
  },
  totalTrips: { 
    type: Number, 
    default: 0 
  },
  vehicleType: { type: String, enum: ['bike', 'car', 'truck', 'van'], default: 'bike' },
  earning: { type: Number, default: 0 },
  lastSeen: { type: Date, default: Date.now },
  location: {                         // location for geospatial queries
    type: { 
      type: String, 
      enum: ['Point'], 
      default: 'Point' 
    },
    coordinates: {                   // [longitude, latitude]
      type: [Number], 
      default: [0, 0] 
    },
     description: String 
  },
  currentRide: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', default: null }
}, { timestamps: true });

driverSchema.index({ location: '2dsphere' });

module.exports = mongoose.model("Driver", driverSchema);