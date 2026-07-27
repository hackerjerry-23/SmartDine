const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    unit: { type: String, default: 'unit' }, // L, kg, pcs...
    quantityAvailable: { type: Number, required: true },
    alertThreshold: { type: Number, required: true },
    supplier: {
      name: String,
      contact: String,
    },
    // simple daily usage history, used for the AI inventory-prediction stub
    usageHistory: [{ date: Date, quantityUsed: Number }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
