const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const WaitingTimeAnalytics = require('../models/WaitingTimeAnalytics');

const getDashboardSummary = asyncHandler(async (req, res) => {
  const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);

  const [todayOrders, salesAgg] = await Promise.all([
    Order.countDocuments({ createdAt: { $gte: startOfDay } }),
    Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
  ]);

  res.json({
    totalSales: salesAgg[0]?.total || 0,
    todaysOrders: todayOrders,
  });
});

const getSalesTrend = asyncHandler(async (req, res) => {
  const { range = 'daily' } = req.query; // daily | weekly
  const days = range === 'weekly' ? 7 : 1;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const trend = await Order.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        total: { $sum: '$totalAmount' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  res.json(trend);
});

const getMostOrderedItems = asyncHandler(async (req, res) => {
  const results = await Order.aggregate([
    { $unwind: '$items' },
    { $group: { _id: '$items.name', quantity: { $sum: '$items.quantity' } } },
    { $sort: { quantity: -1 } },
    { $limit: 10 },
  ]);
  res.json(results);
});

const getPeakHours = asyncHandler(async (req, res) => {
  const results = await Order.aggregate([
    { $group: { _id: { $hour: '$createdAt' }, orders: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  res.json(results);
});

const getWaitingTimeAnalytics = asyncHandler(async (req, res) => {
  const rows = await WaitingTimeAnalytics.find().sort({ date: -1 }).limit(30);
  res.json(rows);
});

module.exports = { getDashboardSummary, getSalesTrend, getMostOrderedItems, getPeakHours, getWaitingTimeAnalytics };
