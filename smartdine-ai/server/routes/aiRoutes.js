const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { recommend, predictDemand, predictInventory, assistant } = require('../controllers/aiController');

router.post('/recommend', recommend);
router.post('/assistant', assistant);
router.post('/predict', protect, authorize('admin', 'staff'), predictDemand);
router.post('/inventory-predict', protect, authorize('admin', 'staff'), predictInventory);

module.exports = router;
