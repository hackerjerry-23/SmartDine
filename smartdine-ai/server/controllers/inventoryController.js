const asyncHandler = require('express-async-handler');
const InventoryItem = require('../models/InventoryItem');

const getInventory = asyncHandler(async (req, res) => {
  res.json(await InventoryItem.find());
});

const createInventoryItem = asyncHandler(async (req, res) => {
  res.status(201).json(await InventoryItem.create(req.body));
});

const updateInventoryItem = asyncHandler(async (req, res) => {
  const item = await InventoryItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!item) { res.status(404); throw new Error('Inventory item not found'); }
  res.json(item);
});

// Alerts = items at or below their threshold - drives the dashboard widget
const getAlerts = asyncHandler(async (req, res) => {
  const items = await InventoryItem.find();
  res.json(items.filter((i) => i.quantityAvailable <= i.alertThreshold));
});

module.exports = { getInventory, createInventoryItem, updateInventoryItem, getAlerts };
