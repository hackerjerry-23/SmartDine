const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getEmailSettings, updateEmailSettings } = require('../controllers/settingsController');

router.get('/email', protect, authorize('admin'), getEmailSettings);
router.put('/email', protect, authorize('admin'), updateEmailSettings);

module.exports = router;
