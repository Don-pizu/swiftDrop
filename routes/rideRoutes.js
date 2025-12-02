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



/**
 * @swagger
 * tags:
 *   name: Rides
 *   description: Ride booking and trip management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     RideLocation:
 *       type: object
 *       required:
 *         - type
 *         - coordinates
 *       properties:
 *         type:
 *           type: string
 *           enum: [Point]
 *           example: Point
 *         coordinates:
 *           type: array
 *           items:
 *             type: number
 *           example: [7.4210, 3.9050]
 *
 *     Ride:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         user:
 *           type: string
 *         rider:
 *           type: string
 *         driver:
 *           type: string
 *         serviceType:
 *           type: string
 *           enum: [passenger, delivery]
 *           example: passenger
 *         pickupLocation:
 *           $ref: '#/components/schemas/RideLocation'
 *         dropoffLocation:
 *           $ref: '#/components/schemas/RideLocation'
 *         status:
 *           type: string
 *           enum: [requested, assigned, accepted, rider_arrived, driver_arrived, in_progress, completed, cancelled, timeout, ride-uncompleted]
 *           example: requested
 *         fare:
 *           type: number
 *         paymentMethod:
 *           type: string
 *           enum: [wallet, card, cash]
 *         paymentStatus:
 *           type: string
 *           enum: [pending, paid, failed, refunded, initialized]
 *         requestedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /rides:
 *   post:
 *     summary: Request a ride (User)
 *     tags: [Rides]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pickup
 *               - dropoff
 *               - serviceType
 *             properties:
 *               serviceType:
 *                 type: string
 *                 enum: [passenger, delivery]
 *                 example: passenger
 *               pickup:
 *                 type: array
 *                 description: "[longitude, latitude]"
 *                 example: [7.4210, 3.9050]
 *               dropoff:
 *                 type: array
 *                 description: "[longitude, latitude]"
 *                 example: [7.5002, 3.9001]
 *     responses:
 *       201:
 *         description: Ride created successfully
 *       400:
 *         description: Invalid input
 */

/**
 * @swagger
 * /rides/{id}:
 *   get:
 *     summary: Get ride by ID
 *     tags: [Rides]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ride details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ride'
 *       404:
 *         description: Ride not found
 */

/**
 * @swagger
 * /rides:
 *   get:
 *     summary: Get all rides (Admin only)
 *     tags: [Rides]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: number
 *           example: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: number
 *           example: 10
 *       - name: serviceType
 *         in: query
 *         schema:
 *           type: string
 *           enum: [passenger, delivery]
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [requested, accepted, in_progress, completed, cancelled]
 *     responses:
 *       200:
 *         description: Paginated list of rides
 */

/**
 * @swagger
 * /rides/{id}/cancel:
 *   delete:
 *     summary: Cancel a ride (User or Admin)
 *     tags: [Rides]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ride cancelled
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Ride not found
 */

/**
 * @swagger
 * /rides/{id}/accept:
 *   put:
 *     summary: Accept a ride (Driver)
 *     tags: [Rides]
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
 *         description: Ride successfully accepted
 *       400:
 *         description: Ride not available
 *       404:
 *         description: Driver profile not found
 */

/**
 * @swagger
 * /rides/{id}/status:
 *   put:
 *     summary: Update ride status (Driver or User)
 *     tags: [Rides]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 description: Driver/User allowed status
 *                 enum: [rider_arrived, driver_arrived, in_progress, completed, cancelled]
 *                 example: in_progress
 *     responses:
 *       200:
 *         description: Ride status updated
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Ride not found
 */






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