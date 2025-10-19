//routes/rideRoutes.js

const express = require('express');
const router = express.Router();
const {
	requestRide,
	getRide,
	getAllRides,
	cancelRide,
	acceptRide,
	updateRideStatus,
} = require('../controllers/rideController');

const { protect, protectRoles } = require('../middleware/authMiddleware');


//Request a ride (user/admin)
router.post('/rides', protect, protectRoles('user','rider', 'admin'), requestRide);

//Get ride by id
router.get('/rides/:id', protect, protectRoles('user', 'rider', 'admin'), getRide);

//Get all rides
router.get('/rides', protect, protectRoles('admin'), getAllRides);

//Accept ride (driver or admin)
router.put('/rides/:id/accept', protect, protectRoles('rider', 'driver', 'admin'), acceptRide);

//Update ride statuse(driver or admin)
router.put('/rides/:id/status', protect, protectRoles('rider', 'driver', 'admin'), updateRideStatus);

//Cancel a ride (user or admin)
router.delete('/rides/:id/cancel', protect, protectRoles('user', 'admin'), cancelRide);

module.exports = router;