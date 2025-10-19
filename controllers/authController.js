 // controllers/authController.js

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { sendOtp } = require('../util/otpService');
const {formatPhone } = require('../util/phoneFormatter');


//Generate JWT Token
const createToken = (user) => {
	return jwt.sign (
		{id: user._id, role: user.role},
		process.env.JWT_SECRET,
		{expiresIn: '1h'}
		);
};



//Register a new user
exports.register = async (req, res, next) => {
	try {

		let { fullname, email, phoneNumber, location, password, confirmPassword, role } = req.body;

		if ( !fullname  || !email  || !phoneNumber || !location|| !password || !confirmPassword) 
			return res.status(400).json({ message: 'All the fields are required'});

    // Format phone number before saving
    phoneNumber = formatPhone(phoneNumber);

		//Check if passwords match
		if (password !== confirmPassword) {
			return res.status(400).json({ message: 'Passwords do not match' });
		}

    //check if email exist
		const eExists = await User.findOne({ email: email });
		if(eExists)
			return res.status(400).json({message: 'Email already exists'});

		//check if phone number exist
		const ePhone = await User.findOne({ phoneNumber: phoneNumber});
		if(ePhone)
			return res.status(400).json({ message: "Phone number already exists"});

		//check for location
		if(!location)
			return res.status(400).json({ message: "Location is required"});

		// Generate 4-digit OTP
		const otp = Math.floor(1000 + Math.random() * 9000).toString();
		const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min



		const user = await User.create({
			fullname,
			email,
			phoneNumber,
			location,
			password,
			role: ['rider', 'driver', 'admin'].includes(role) ? role : 'user',
			otp,
     	otpExpires,
		});

    await sendOtp({ type: "email", to: user.email, otp });
		
		res.status(201).json({ 
	      message: 'Kidly check your email for OTP to verify',
	      _id: user._id,
	      email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
       });


	} catch (err) {
		res.status(500).json({ message: 'Internal server error' });
	}
};


exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) 
      return res.status(400).json({ message: 'User not found' });

    if (user.otp !== otp)
      return res.status(400).json({ message: 'Invalid OTP' });

    if(user.otpExpires < Date.now()) 
      return res.status(400).json({ message: 'Expired OTP' });

    user.status = 'verified';
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    res.json({ 
      message: 'Account verified successfully',
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      location: user.location,
      role: user.role,
      status: user.status,
      token: createToken(user)
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// Resend OTP
exports.resendOtp = async (req, res) => {
  try {
    let { email, phoneNumber, channel = "sms" } = req.body; 
    // channel can be "sms" or "whatsapp" when using phoneNumber

    let user;

    if (email) {
      // Find by email
      user = await User.findOne({ email: email.toLowerCase() });
      if (!user) return res.status(400).json({ message: "User not found" });
    } 
    
    else if (phoneNumber) {
      phoneNumber = formatPhone(phoneNumber);
      // Find by phone
      user = await User.findOne({ phoneNumber });
      if (!user) return res.status(400).json({ message: "User not found" });
    } 
    
    else {
      return res.status(400).json({ message: "Provide either email or phoneNumber" });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({ message: "Account already verified" });
    }

    // Generate new OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // Send OTP based on input
    if (email) {
      await sendOtp({ type: "email", to: user.email, otp });
      return res.json({ message: "New OTP sent to email", email: user.email });
    }

    if (phoneNumber) {
      if (channel === "whatsapp") {
        await sendOtp({ type: "whatsapp", to: user.phoneNumber, otp });
        return res.json({ message: "New OTP sent via WhatsApp", phoneNumber: user.phoneNumber });
      } else {
        await sendOtp({ type: "sms", to: user.phoneNumber, otp });
        return res.json({ message: "New OTP sent via SMS", phoneNumber: user.phoneNumber });
      }
    }

  } catch (err) {
    console.error("Resend OTP Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



//Login user 
exports.login = async (req, res, next) => {
	try{

		const { email, password } = req.body;

		//check for email
		const user = await User.findOne({ email: email });
		if(!user)
			return res.status(401).json({message: 'Email not found'});

    //check if the user has verified
		if (!user.isVerified) 
		  return res.status(401).json({ message: "Please verify your account first" });

    if(user.status === 'pending_verification')
      return res.status(401).json({ message: 'Kindly verify your account first'});

    //chech if oassword match
		const userPassword = await user.matchPassword(password);
		if(!userPassword)
			return res.status(401).json({message: 'Incorrect password'});

		if ( user && userPassword ) {
			res.json({
        message: 'You have successfully logged in',
				_id: user._id,
				fullname: user.fullname,
				email: user.email,
				phoneNumber: user.phoneNumber,
				location: user.location,
				role:user.role,
        status: user.status,
				token: createToken(user)
			});
		} else {
			return res.status(401).json({ message: 'Invalid Credentials'});
		}

	}catch (err) {
		res.status(500).json({ message: 'Internal server error' });
	}
};




//GET   Get all users

exports.getAllUsers = async (req, res, next) => {
	try {

		const {page = 1, limit = 10, email} = req.query;
		const query = {};   //for filtering

	if (email) 
		query.email = email;

		const skip = (parseInt(page) - 1) * parseInt(limit);

		const users = await User.find(query)
		 								.skip(skip)
		 								.limit(parseInt(limit))
		 								.sort({createdAt: -1});

		const totalUsers = await User.countDocuments(query);
		const totalPages = Math.ceil(totalUsers / limit);

		res.json({
			users,
			page: parseInt(page),
			totalPages,
			totalUsers
		});

	} catch {
		res.status(500).json({ message: 'Internal server error' });
	}
};


// forgotPassword
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) 
    	return res.status(400).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;    // 15 min

    await user.save();

    // Build reset URL
    const resetUrl = `https://localhost:5000/api/auth/reset-password/${resetToken}`; ///////change to frontend link

    // send via email
    await sendOtp({ 
      type: "email",
      to: user.email, 
      otp: `Reset your password using this link: ${resetUrl}` 
    });
    
    res.json({ message: "Password reset link sent to email" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Hash the token from URL to compare with DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");


    console.log("Raw token:", token); // ✅ Debug
    console.log("Hashed token:", hashedToken);


    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() } 
    });

    if (!user) 
    	return res.status(400).json({ message: "Invalid or expired token" });

    // Update password
    user.password = password; //await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: "Password reset successful. You can now login." });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// UPDATE USER (including image)
exports.updateUser = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { fullname, email, phoneNumber, location } = req.body;

    const updateFields = { fullname, email, phoneNumber, location };

    // If an image is uploaded
    if (req.file) {
      updateFields.profilePicture =  `/uploads/${req.file.filename}`; 
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User updated successfully",
      user: {
        _id: updatedUser._id,
        fullname: updatedUser.fullname,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        location: updatedUser.location,
        profilePicture: updatedUser.profilePicture,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// UPDATE USER (including image)
exports.updateAdmin = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { fullname, email, phoneNumber, location, role } = req.body;

    const updateFields = { fullname, email, phoneNumber, location, role };

    // If an image is uploaded
    if (req.file) {
      updateFields.profilePicture =  `/uploads/${req.file.filename}`; 
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User updated successfully",
      user: {
        _id: updatedUser._id,
        fullname: updatedUser.fullname,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        location: updatedUser.location,
        profilePicture: updatedUser.profilePicture,
        role: updatedUser.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// GET USER PROFILE
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      location: user.location,
      profilePicture: user.profilePicture,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
