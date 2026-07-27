const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  joinQueue,
  getQueueStatus,
  getFullQueue,
  leaveQueue,
  notifyQueueEntry,
  seatQueueEntry,
} = require('../controllers/queueController');

router.post('/join', joinQueue);
router.get('/status/:id', getQueueStatus);
router.get('/status', protect, authorize('staff', 'admin'), getFullQueue); // dashboard list
router.patch('/leave/:id', leaveQueue);
router.post('/notify/:id', protect, authorize('staff', 'admin'), notifyQueueEntry);
router.patch('/seat/:id', protect, authorize('staff', 'admin'), seatQueueEntry);

module.exports = router;
