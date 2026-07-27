const asyncHandler = require('express-async-handler');
const MenuItem = require('../models/MenuItem');

const getMenu = asyncHandler(async (req, res) => {
  const { category, search, availableOnly } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (availableOnly === 'true') filter.isAvailable = true;
  if (search) filter.name = { $regex: search, $options: 'i' };
  res.json(await MenuItem.find(filter));
});

const createMenuItem = asyncHandler(async (req, res) => {
  res.status(201).json(await MenuItem.create(req.body));
});

const updateMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!item) { res.status(404); throw new Error('Menu item not found'); }
  res.json(item);
});

// Toggles availability instantly - this is what "Live Availability" reads from
const setAvailability = asyncHandler(async (req, res) => {
  const item = await MenuItem.findByIdAndUpdate(
    req.params.id,
    { isAvailable: req.body.isAvailable },
    { new: true }
  );
  if (!item) { res.status(404); throw new Error('Menu item not found'); }
  const { getIO } = require('../utils/socket');
  getIO()?.emit('menu:availability-changed', { id: item._id, isAvailable: item.isAvailable });
  res.json(item);
});

const deleteMenuItem = asyncHandler(async (req, res) => {
  await MenuItem.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = { getMenu, createMenuItem, updateMenuItem, setAvailability, deleteMenuItem };
