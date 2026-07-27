const mongoose = require('mongoose');

/**
 * Live status of a table. Kept separate from Table (static info) so we can
 * update it very frequently without touching the table's config document,
 * and so we keep a clean history of state transitions for analytics
 * (average turnover time, cleaning time, etc).
 */
const tableStatusSchema = new mongoose.Schema(
  {
    table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true, unique: true },
    status: {
      type: String,
      enum: ['available', 'reserved', 'occupied', 'cleaning'],
      default: 'available',
      index: true,
    },
    currentParty: {
      size: { type: Number, default: 0 },
      seatedAt: { type: Date, default: null },
      order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
      reservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation', default: null },
    },
    // Prediction fields, recomputed whenever status changes or on a schedule
    estimatedFreeAt: { type: Date, default: null },
    estimatedDiningDurationMin: { type: Number, default: null },
    lastStatusChangeAt: { type: Date, default: Date.now },
    // History of durations for this table, used to refine predictions over time
    diningHistoryMin: [{ type: Number }],
  },
  { timestamps: true }
);

tableStatusSchema.methods.averageDiningDuration = function (fallbackMin) {
  if (!this.diningHistoryMin || this.diningHistoryMin.length === 0) return fallbackMin;
  const recent = this.diningHistoryMin.slice(-10); // last 10 sittings
  const sum = recent.reduce((a, b) => a + b, 0);
  return Math.round(sum / recent.length);
};

module.exports = mongoose.model('TableStatus', tableStatusSchema);
