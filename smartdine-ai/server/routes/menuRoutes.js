const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getMenu, createMenuItem, updateMenuItem, setAvailability, deleteMenuItem } = require('../controllers/menuController');

router.get('/', getMenu);
router.post('/', protect, authorize('admin'), createMenuItem);
router.put('/:id', protect, authorize('admin'), updateMenuItem);
router.patch('/:id/availability', protect, authorize('admin', 'staff'), setAvailability);
router.delete('/:id', protect, authorize('admin'), deleteMenuItem);

module.exports = router;
