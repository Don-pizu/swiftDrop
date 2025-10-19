//schema/KYC.js

const mongoose = require("mongoose");

// Flexible KYC depending on role
const kycSchema = new mongoose.Schema({
      user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // reference User collection
      },
  	kycUserPicture: {
            type: String,
            default: '',                  // will store file path or url
      },
  	idCard: {
            type: String,             	//Id card for riders and drivers
            default: '',
      },
  	driverLicense: {
            type: String,           	//driver licenses
            default: '',
      }, 
  	bikeDetails: {										// bike details
  		plateNumber: String,
  		bikeModel: String,
  		bikeColor: String
  	},
  	vehicleDetails: {
  		plateNumber: String,
  		carModel: String,
  		carColor: String
  	},
      address : {
            type: String,
      },
  	status: {                           //KYC status
  		type: String,
  		enum: ["pending", "approved", "rejected"],
      default: "pending"
  	}
}, {timestamps: true} );

module.exports = mongoose.model("KYC", kycSchema);