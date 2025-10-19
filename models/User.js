// models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');  //For hashing password

//User schema
const userSchema = new mongoose.Schema({
	fullname: {
		type: String,
		required: true,                //it is needed
		trim: true
	},
	email: {
		type: String,
		required: true,                //it is needed
		unique: true,                   // must be unique for each users
		trim: true
	},
	phoneNumber: {
		type: String,
		required:true,                 //it is needed
		unique: true,                  // must be unique for each users
		validate: {
	    validator: function (v) {
	    	// E.164 format: + and up to 15 digits
		    return /^\+[1-9]\d{6,14}$/.test(v); // using +234
		    },
		    message: "Phone number must be in international format, e.g. +2348012345678"
		  }
	},
	location: {
		type: String,
		required: true,                //it is needed
		trim: true,
	},
	password: {
		type: String,
		required: true,               //it is needed
		minlength: 6,                 // minimum of 6 letters
	},
	confirmPassword: {             // this field is just for validation, not stored
		type: String,
		//required: true,          //it is needed
		validate: {
	      validator: function (v) {         //to validate the fisrt password
	        return v === this.password;
	      },
	      message: "Passwords do not match"
	    }
	},
	role: { 
		type: String, 
		enum: ['user', 'rider', 'driver', 'admin'], 
		default: 'user' 
	},
	status: {                            //Registration status
  	type: String, 
  	enum: ["pending_verification", "verified", "kyc_pending", "active"], 
  	default: "pending_verification" 
  },
	isVerified: { 
    type: Boolean, 
    default: false 
  },

	otp: {
    type: String 
   },
  otpExpires: { 
    type: Date 
  },
  profilePicture: {
  	type: String,
  	default: '',   // will store file path or url
  },
  resetPasswordToken: { 
  	type: String 
  },   
  resetPasswordExpire: { 
  	type: Date 
  }, 
}, { timestamps: true });


// Remove passwordConfirm before saving to DB
userSchema.pre("save", function (next) {
  this.confirmPassword = undefined;
  next();
});


//Password hashing before saving
userSchema.pre('save', async function (next) {
	if (!this.isModified('password'))
		return next();          /// If password is not change

	const salt = await bcrypt.genSalt(10);   //Generate salt

	this.password = await bcrypt.hash(this.password, salt);  //Hash password
	next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);     //using bcrypt to compare passwords
};

module.exports = mongoose.model('User', userSchema);
