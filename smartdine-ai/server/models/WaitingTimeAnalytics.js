const mongoose = require('mongoose');

/**
 * Daily rollup used by the admin "Waiting Time Analytics" and
 * "Peak Queue Hours" widgets. Written by a scheduled job (see
 * utils/analyticsJob.js) rather than computed live on every dashboard load.
 */
const waitingTimeAnalyticsSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true }, // truncated to day
    avgWaitMin: { type: Number, default: 0 },
    avgTableTurnoverMin: { type: Number, default: 0 },
    totalQueued: { type: Number, default: 0 },
    totalSeatedFromQueue: { type: Number, default: 0 },
    totalCancelledFromQueue: { type: Number, default: 0 },
    totalExpiredFromQueue: { type: Number, default: 0 },
    // 24 buckets, one per hour, used for the "peak queue hours" chart
    hourlyQueueCounts: { type: [Number], default: () => Array(24).fill(0) },
  },
  { timestamps: true }
);

waitingTimeAnalyticsSchema.index({ date: 1 }, { unique: true });

module.exports = mongoose.model('WaitingTimeAnalytics', waitingTimeAnalyticsSchema);
