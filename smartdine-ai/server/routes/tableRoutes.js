const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getAllTableStatuses,
  allocateTable,
  overrideAllocation,
  confirmAllocation,
  seatTable,
  clearTable,
  predictAvailability,
} = require('../controllers/tableController');

// Public-ish: customers trigger allocation when booking/checking in via QR
router.post('/allocate', allocateTable);
router.get('/status', getAllTableStatuses);
router.get('/predict-availability/:tableId', predictAvailability);

// Staff/admin only: confirm or override AI suggestions, change physical state
router.patch('/allocate/:id/override', protect, authorize('staff', 'admin'), overrideAllocation);
router.post('/allocate/:id/confirm', protect, authorize('staff', 'admin'), confirmAllocation);
router.patch('/:tableId/seat', protect, authorize('staff', 'admin'), seatTable);
router.patch('/:tableId/clear', protect, authorize('staff', 'admin'), clearTable);

module.exports = router;
