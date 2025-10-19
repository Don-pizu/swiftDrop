//routes/driverRoutes.js

const express = require('express');
const router = express.Router();
const {
	createDriverProfile,
	getDriver,
	getAllDrivers,
	updateDriverStatus,
	findNearbyDrivers,
	deleteDriver
} = require('../controllers/driverController');

const { protect, protectRoles } = require('../middleware/authMiddleware');



// Post driver
router.post('/drivers', protect, protectRoles('rider', 'driver', 'admin'), createDriverProfile);

// Get a driver
router.get('/drivers/:id', protect, getDriver);

// Get all drivers
router.get('/drivers', protect, getAllDrivers);

//Update availability(status) + live location
router.put('/drivers/:id', protect, protectRoles('rider', 'driver', 'admin'), updateDriverStatus);


//Get nearby riders/drivers (for testing / rider matching)
router.get('/drivers/nearby', protect, protectRoles('user', 'admin'), findNearbyDrivers);

//Delete drivers (admin)
router.delete('/drivers/:id', protect, protectRoles('admin'), deleteDriver);

module.exports = router;
