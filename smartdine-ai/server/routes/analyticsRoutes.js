const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getDashboardSummary, getSalesTrend, getMostOrderedItems, getPeakHours, getWaitingTimeAnalytics,
} = require('../controllers/analyticsController');

router.use(protect, authorize('admin'));
router.get('/summary', getDashboardSummary);
router.get('/sales-trend', getSalesTrend);
router.get('/most-ordered', getMostOrderedItems);
router.get('/peak-hours', getPeakHours);
router.get('/waiting-time', getWaitingTimeAnalytics);

module.exports = router;
