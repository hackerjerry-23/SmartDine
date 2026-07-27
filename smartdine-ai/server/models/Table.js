const mongoose = require('mongoose');

/**
 * A physical table in the restaurant.
 * Capacity + location are used by the Smart Table Optimizer to score fit.
 */
const tableSchema = new mongoose.Schema(
  {
    tableNumber: { type: Number, required: true, unique: true },
    capacity: { type: Number, required: true }, // max guests
    zone: {
      type: String,
      enum: ['indoor', 'outdoor', 'window', 'private', 'bar'],
      default: 'indoor',
    },
    // Used to compute "nearest available table" - simple grid coords are enough
    // for a distance heuristic without needing a full floor-plan engine.
    positionX: { type: Number, default: 0 },
    positionY: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }, // false = out of service
  },
  { timestamps: true }
);

module.exports = mongoose.model('Table', tableSchema);
