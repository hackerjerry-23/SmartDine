const mongoose = require('mongoose');

/**
 * Records every allocation decision the system makes. This is what powers
 * "AI Table Allocation Suggestions" on the admin dashboard and lets us
 * measure how often staff override the AI (useful for improving the model).
 */
const tableAllocationSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    partySize: { type: Number, required: true },
    requestedZone: { type: String, default: null },

    // What the AI recommended
    recommendedTable: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
    recommendationScore: { type: Number }, // 0-100, higher = better fit
    recommendationReason: { type: String }, // human-readable explanation
    estimatedAvailableInMin: { type: Number }, // 0 if immediately available
    alternatives: [
      {
        table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
        score: Number,
        estimatedAvailableInMin: Number,
      },
    ],

    // What actually happened
    finalTable: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
    wasOverridden: { type: Boolean, default: false },
    overriddenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    overrideReason: { type: String, default: null },

    status: {
      type: String,
      enum: ['suggested', 'confirmed', 'seated', 'cancelled'],
      default: 'suggested',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TableAllocation', tableAllocationSchema);
