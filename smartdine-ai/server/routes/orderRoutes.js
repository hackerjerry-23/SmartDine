const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { createOrder, getMyOrders, getAllOrders, updateOrderStatus } = require('../controllers/orderController');

router.post('/', protect, createOrder);
router.get('/mine', protect, getMyOrders);
router.get('/', protect, authorize('staff', 'admin'), getAllOrders);
router.patch('/:id/status', protect, authorize('staff', 'admin'), updateOrderStatus);

module.exports = router;
