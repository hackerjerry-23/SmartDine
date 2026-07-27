/**
 * Smart Queue Management - wait time estimator.
 *
 * Estimates how long a newly-joined (or existing) party will wait, using:
 *   - number of parties ahead in the queue
 *   - current table occupancy (how many tables are free / about to free up)
 *   - average dining duration (table turnover rate)
 *
 * This is a queueing-theory-lite model: we simulate tables freeing up over
 * time and "seat" queued parties into them in order, which is more accurate
 * than a flat "X people ahead * Y minutes" formula because it accounts for
 * multiple tables freeing up in parallel.
 */

const { estimateMinutesUntilFree, DEFAULT_DINING_DURATION_MIN } = require('./tableOptimizer');

/**
 * @param {Array} tableStatuses - all TableStatus docs (with populated table.capacity)
 * @param {Array} queueAhead - queue entries ahead of this party (status: waiting/notified),
 *                             ordered by joinedAt ascending
 * @param {Number} partySize
 * @returns {Number} estimated wait in minutes
 */
function estimateWaitTime(tableStatuses, queueAhead, partySize) {
  // Build a timeline of "free-at" minutes for every table big enough for at
  // least this party size (smaller tables can't help this party or the
  // parties ahead of it that also need capacity, but we keep the simulation
  // simple and pool all tables >= partySize... in practice you'd size-bucket
  // per party in the queue individually).
  const eligibleTables = tableStatuses.filter((ts) => ts.table && ts.table.capacity >= partySize);

  if (eligibleTables.length === 0) {
    // No table can ever fit this party - surface a large number so the UI
    // can show "please speak to staff" rather than a false estimate.
    return 999;
  }

  let freeAtTimes = eligibleTables.map((ts) => estimateMinutesUntilFree(ts));

  // Simulate seating each party ahead in line into the earliest-freeing table.
  const partiesToSeatFirst = queueAhead.length;
  for (let i = 0; i < partiesToSeatFirst; i++) {
    freeAtTimes.sort((a, b) => a - b);
    const seatTime = freeAtTimes[0];
    // That table becomes occupied for another average dining duration
    freeAtTimes[0] = seatTime + DEFAULT_DINING_DURATION_MIN;
  }

  freeAtTimes.sort((a, b) => a - b);
  return Math.max(0, Math.round(freeAtTimes[0]));
}

/**
 * Compute a queue entry's position among currently-waiting parties.
 */
function computeQueuePosition(allWaitingSortedByJoinedAt, queueEntryId) {
  const idx = allWaitingSortedByJoinedAt.findIndex((q) => String(q._id) === String(queueEntryId));
  return idx === -1 ? null : idx + 1; // 1-indexed position
}

module.exports = { estimateWaitTime, computeQueuePosition };
