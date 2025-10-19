// middleware/ authMiddleware.js

const jwt = require ('jsonwebtoken');
const User = require ('../models/User');

// Middleware to verify token
exports.protect = async (req, res, next) => {
	let token;

	// condition to check for Bearer token
	if (
		req.headers.authorization && 
		req.headers.authorization.startsWith('Bearer')
	) {
		try {
			// Extract token
			token = req.headers.authorization.split(' ')[1];

			// Verify token
			const decoded = jwt.verify(token, process.env.JWT_SECRET);

			// Attach user to request (excluding password)
			req.user = await User.findById(decoded.id).select('-password');

			next();
		} catch (error) {
			return res.status(401).json({ message: 'Not Authorized, token failed' });
		}
	}

	if (!token) {
		  console.error("JWT error:", error.message);
		return res.status(401).json({ message: 'Not Authorized, No token' });
	}
};



// Middleware to restrict access based on role
exports.protectRoles = (...roles) => {
	return (req, res, next) => {
		// Check if user's role is included in allowed roles
		if (!roles.includes(req.user.role)) {
			return res.status(403).json({ message: 'Forbidden: Insufficient role permission' });
		}
		next();
	};
}; 