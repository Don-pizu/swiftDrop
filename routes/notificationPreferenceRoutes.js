// routes/notificationPreferenceRoutes.js

const express = require('express');
const router = express.Router();
const { getPreferences, updatePreferences, resetPreferences } = require('../controllers/notificationPreferenceController');
const { protect, protectRoles } = require('../middleware/authMiddleware');  

router.route('/notification/preferences')
  .get(protect, getPreferences)
  .put(protect, updatePreferences)
  .delete(protect, resetPreferences);

module.exports = router;
