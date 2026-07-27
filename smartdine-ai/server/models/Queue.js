const mongoose = require('mongoose');

/**
 * A single party's entry in the virtual queue.
 * Position is NOT stored as a fixed number - it's derived at read-time from
 * `joinedAt` order among 'waiting' entries, so it self-corrects whenever
 * someone leaves/cancels without needing a re-indexing job.
 */
const queueSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    guestName: { type: String, required: true }, // supports walk-ins without an account
    guestPhone: { type: String, required: true },
    partySize: { type: Number, required: true },
    zonePreference: { type: String, default: null },

    status: {
      type: String,
      enum: ['waiting', 'notified', 'seated', 'cancelled', 'expired'],
      default: 'waiting',
      index: true,
    },

    joinedAt: { type: Date, default: Date.now },
    notifiedAt: { type: Date, default: null }, // when we told them "table ready"
    expiresAt: { type: Date, default: null }, // grace period after notify (e.g. +5 min)
    seatedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },

    assignedTable: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', default: null },

    // Snapshot of the estimate at time of join, kept for analytics accuracy checks
    initialEstimatedWaitMin: { type: Number, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Queue', queueSchema);
