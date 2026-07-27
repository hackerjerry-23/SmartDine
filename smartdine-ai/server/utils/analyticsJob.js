const Queue = require('../models/Queue');
const TableStatus = require('../models/TableStatus');
const WaitingTimeAnalytics = require('../models/WaitingTimeAnalytics');

/**
 * Rolls up yesterday's queue + table-turnover activity into one
 * WaitingTimeAnalytics document. Scheduled to run just after midnight
 * (see utils/scheduler.js), but can also be called directly for backfills
 * or tests - it takes an explicit `forDate` so it isn't tied to "now".
 */
async function computeDailyRollup(forDate = new Date(Date.now() - 24 * 60 * 60 * 1000)) {
  const dayStart = new Date(forDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const queueEntries = await Queue.find({ joinedAt: { $gte: dayStart, $lt: dayEnd } });

  const seated = queueEntries.filter((q) => q.status === 'seated');
  const cancelled = queueEntries.filter((q) => q.status === 'cancelled');
  const expired = queueEntries.filter((q) => q.status === 'expired');

  const waitTimes = seated
    .filter((q) => q.seatedAt)
    .map((q) => Math.round((q.seatedAt - q.joinedAt) / 60000));
  const avgWaitMin = waitTimes.length ? Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length) : 0;

  const hourlyQueueCounts = Array(24).fill(0);
  queueEntries.forEach((q) => { hourlyQueueCounts[new Date(q.joinedAt).getHours()] += 1; });

  // Table turnover: pull that day's recorded dining durations across all tables
  const tableStatuses = await TableStatus.find();
  const allDurations = tableStatuses.flatMap((t) => t.diningHistoryMin || []);
  const avgTableTurnoverMin = allDurations.length
    ? Math.round(allDurations.reduce((a, b) => a + b, 0) / allDurations.length)
    : 0;

  const doc = await WaitingTimeAnalytics.findOneAndUpdate(
    { date: dayStart },
    {
      date: dayStart,
      avgWaitMin,
      avgTableTurnoverMin,
      totalQueued: queueEntries.length,
      totalSeatedFromQueue: seated.length,
      totalCancelledFromQueue: cancelled.length,
      totalExpiredFromQueue: expired.length,
      hourlyQueueCounts,
    },
    { upsert: true, new: true }
  );

  return doc;
}

module.exports = { computeDailyRollup };
