const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const { getIO } = require('../utils/socket');

const createOrder = asyncHandler(async (req, res) => {
  const { items, tableId } = req.body;
  const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const order = await Order.create({ customer: req.user._id, table: tableId, items, totalAmount });
  getIO()?.to('admin').emit('order:new', { orderId: order._id });
  res.status(201).json(order);
});

const getMyOrders = asyncHandler(async (req, res) => {
  res.json(await Order.find({ customer: req.user._id }).sort({ createdAt: -1 }));
});

const getAllOrders = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  res.json(await Order.find(filter).populate('customer', 'name').sort({ createdAt: -1 }));
});

// Received -> Cooking -> Ready -> Delivered
const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!order) { res.status(404); throw new Error('Order not found'); }
  getIO()?.to(`customer:${order.customer}`).emit('order:status-changed', { orderId: order._id, status: order.status });
  res.json(order);
});

module.exports = { createOrder, getMyOrders, getAllOrders, updateOrderStatus };
