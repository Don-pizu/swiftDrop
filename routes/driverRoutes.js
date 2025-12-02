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


/**
 * @swagger
 * tags:
 *   name: Driver
 *   description: Manage driver(rider and driver) controller
 */


/**
 * @swagger
 * /drivers:
 *   post:
 *     summary: Create a rider or driver profile (linked to user)
 *     tags: [Driver]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [available, on-trip, offline]
 *               vehicleType:
 *                 type: string
 *                 enum: [bike, car, truck, van]
 *               location:
 *                 type: object
 *                 properties:
 *                   lng:
 *                     type: number
 *                   lat:
 *                     type: number
 *                   description:
 *                     type: string
 *     responses:
 *       201:
 *         description: Profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Driver'
 *       400:
 *         description: Validation failed
 *       403:
 *         description: Not allowed (wrong role)
 *       500:
 *         description: Internal server error
 */



/**
 * @swagger
 * /drivers/{id}:
 *   get:
 *     summary: Get driver profile by ID
 *     tags: [Driver]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Driver found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Driver'
 *       404:
 *         description: Driver not found
 *       500:
 *         description: Internal server error
 */



/**
 * @swagger
 * /drivers:
 *   get:
 *     summary: Get all drivers with filtering & pagination
 *     tags: [Driver]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, on-trip, offline]
 *       - in: query
 *         name: rating
 *         schema:
 *           type: number
 *       - in: query
 *         name: totalTrips
 *         schema:
 *           type: number
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *           description: Search by location description
 *     responses:
 *       200:
 *         description: List of drivers
 *       500:
 *         description: Internal server error
 */



/**
 * @swagger
 * /drivers/{id}:
 *   put:
 *     summary: Update driver availability status and live coordinates
 *     tags: [Driver]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [available, on-trip, offline]
 *               lng:
 *                 type: number
 *               lat:
 *                 type: number
 *     responses:
 *       200:
 *         description: Status/location updated
 *       404:
 *         description: Driver not found
 *       400:
 *         description: Invalid status
 *       500:
 *         description: Internal server error
 */



/**
 * @swagger
 * /drivers/nearby:
 *   get:
 *     summary: Find nearby drivers within a given radius
 *     tags: [Driver]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: lng
 *         in: query
 *         required: true
 *         schema:
 *           type: number
 *       - name: lat
 *         in: query
 *         required: true
 *         schema:
 *           type: number
 *       - name: radius
 *         in: query
 *         schema:
 *           type: number
 *           default: 5
 *           description: Radius in kilometers
 *     responses:
 *       200:
 *         description: Nearby driver list
 *       400:
 *         description: Invalid or missing coordinates
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /drivers/{id}:
 *   delete:
 *     summary: Delete a driver profile (Admin only)
 *     tags: [Driver]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Driver deleted successfully
 *       404:
 *         description: Driver not found
 *       500:
 *         description: Internal server error
 */






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
