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


router.post('/kyc', protect, protectRoles('rider', 'driver', 'admin'),  kycUpload, createKYC);
router.get('/kyc/:id', protect, protectRoles('rider', 'driver', 'admin'), getKYC);
router.get('/kycs', protect, protectRoles('admin'), getAllKYC);
router.put('/kyc/:id', protect, protectRoles('rider', 'driver', 'admin'),  kycUpload, updateKYC);
router.delete('/kyc/:id', protect, protectRoles('admin'), deleteKYC);

module.exports = router;