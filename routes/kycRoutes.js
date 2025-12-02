//routes/kycRoutes.js

const express = require('express');
const router = express.Router();
const { createKYC, getKYC, getAllKYC, updateKYC, deleteKYC } = require('../controllers/kycController');
const { protect, protectRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Allow multiple KYC fields (each maxCount: 1)
const kycUpload = upload.fields([
  { name: 'kycUserPicture', maxCount: 1 },
  { name: 'idCard', maxCount: 1 },
  { name: 'driverLicense', maxCount: 1 }
]);



/**
 * @swagger
 * tags:
 *   name: KYC
 *   description: Manage rider and driver KYC records
 */

/**
 * @swagger
 * /kyc:
 *   post:
 *     summary: Submit a new KYC record (for rider or driver)
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               kycUserPicture:
 *                 type: string
 *                 format: binary
 *                 description: User selfie or photo
 *               idCard:
 *                 type: string
 *                 format: binary
 *                 description: ID card photo (NIN, Voter’s Card, etc.)
 *               driverLicense:
 *                 type: string
 *                 format: binary
 *                 description: Driver’s license (required for drivers only)
 *               address:
 *                 type: string
 *                 description: Residential or business address
 *               bikeDetails:
 *                 type: object
 *                 description: Required for riders
 *                 properties:
 *                   plateNumber:
 *                     type: string
 *                   bikeModel:
 *                     type: string
 *                   bikeColor:
 *                     type: string
 *               vehicleDetails:
 *                 type: object
 *                 description: Required for drivers
 *                 properties:
 *                   plateNumber:
 *                     type: string
 *                   carModel:
 *                     type: string
 *                   carColor:
 *                     type: string
 *     responses:
 *       201:
 *         description: KYC successfully submitted
 *       400:
 *         description: Missing or invalid fields
 *       401:
 *         description: Unauthorized (no or invalid token)
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /kyc/{id}:
 *   get:
 *     summary: Get a single KYC record by ID
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: KYC record ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: KYC record retrieved successfully
 *       404:
 *         description: KYC record not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /kycs:
 *   get:
 *     summary: Get all KYC records (Admin only)
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *         description: Page number for pagination (default 1)
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *         description: Number of results per page (default 10)
 *       - name: bikeDetails
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter by bike details
 *       - name: vehicleDetails
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter by vehicle details
 *     responses:
 *       200:
 *         description: KYC list retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /kyc/{id}:
 *   put:
 *     summary: Update a KYC record (rider, driver, or admin)
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: KYC record ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: string
 *               kycUserPicture:
 *                 type: string
 *                 format: binary
 *               idCard:
 *                 type: string
 *                 format: binary
 *               driverLicense:
 *                 type: string
 *                 format: binary
 *               bikeDetails:
 *                 type: object
 *                 properties:
 *                   plateNumber:
 *                     type: string
 *                   bikeModel:
 *                     type: string
 *                   bikeColor:
 *                     type: string
 *               vehicleDetails:
 *                 type: object
 *                 properties:
 *                   plateNumber:
 *                     type: string
 *                   carModel:
 *                     type: string
 *                   carColor:
 *                     type: string
 *     responses:
 *       200:
 *         description: KYC updated successfully
 *       404:
 *         description: KYC not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /kyc/{id}:
 *   delete:
 *     summary: Delete a KYC record (Admin only)
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: KYC record ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: KYC deleted successfully
 *       404:
 *         description: KYC not found
 *       500:
 *         description: Internal server error
 */



router.post('/kyc', protect, protectRoles('rider', 'driver', 'admin'),  kycUpload, createKYC);
router.get('/kyc/:id', protect, protectRoles('rider', 'driver', 'admin'), getKYC);
router.get('/kycs', protect, protectRoles('admin'), getAllKYC);
router.put('/kyc/:id', protect, protectRoles('rider', 'driver', 'admin'),  kycUpload, updateKYC);
router.delete('/kyc/:id', protect, protectRoles('admin'), deleteKYC);

module.exports = router;