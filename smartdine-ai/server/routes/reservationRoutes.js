const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { createReservation, getMyReservations, getAllReservations, updateReservationStatus } = require('../controllers/reservationController');

router.post('/', protect, createReservation);
router.get('/mine', protect, getMyReservations);
router.get('/', protect, authorize('staff', 'admin'), getAllReservations);
router.patch('/:id/status', protect, authorize('staff', 'admin'), updateReservationStatus);

module.exports = router;
