const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getInventory, createInventoryItem, updateInventoryItem, getAlerts } = require('../controllers/inventoryController');

router.get('/', protect, authorize('admin', 'staff'), getInventory);
router.post('/', protect, authorize('admin'), createInventoryItem);
router.put('/:id', protect, authorize('admin'), updateInventoryItem);
router.get('/alerts', protect, authorize('admin', 'staff'), getAlerts);

module.exports = router;
