/**
 * Smart Table Optimizer
 * ----------------------
 * Given a party size (and optional zone preference), scores every table and
 * returns a ranked list of recommendations. This is deliberately a
 * transparent, explainable heuristic (not a black-box model) because staff
 * need to trust and be able to override it - but it's structured so the
 * scoring function can later be swapped for a learned model without
 * touching the controller.
 *
 * Scoring factors (weights sum to 100):
 *   - Capacity fit        (40 pts): penalize both undersized and oversized tables
 *   - Availability now     (30 pts): available > cleaning > reserved-soon > occupied
 *   - Wait time             (20 pts): sooner estimated free time scores higher
 *   - Zone match             (10 pts): matches requested zone
 */

const DEFAULT_DINING_DURATION_MIN = Number(process.env.DEFAULT_DINING_DURATION_MIN) || 60;
const TABLE_BUFFER_MIN = Number(process.env.TABLE_BUFFER_MIN) || 5; // cleaning/reset time

function capacityScore(capacity, partySize) {
  if (capacity < partySize) return 0; // can't seat them at all
  const overflow = capacity - partySize;
  // Ideal is 0-1 seats of headroom. Penalize wasted seats (e.g. seating 2 at a table for 8).
  if (overflow <= 1) return 40;
  if (overflow === 2) return 32;
  if (overflow === 3) return 22;
  return 10;
}

function availabilityScore(status) {
  switch (status) {
    case 'available':
      return 30;
    case 'cleaning':
      return 18; // will be free very soon
    case 'reserved':
      return 8; // free later, depends on reservation time
    case 'occupied':
      return 4;
    default:
      return 0;
  }
}

function waitTimeScore(estimatedAvailableInMin) {
  if (estimatedAvailableInMin <= 0) return 20;
  if (estimatedAvailableInMin <= 5) return 16;
  if (estimatedAvailableInMin <= 10) return 12;
  if (estimatedAvailableInMin <= 20) return 6;
  return 2;
}

function zoneScore(tableZone, requestedZone) {
  if (!requestedZone) return 10; // no preference = full marks, don't penalize
  return tableZone === requestedZone ? 10 : 3;
}

/**
 * Estimate minutes until a table becomes free.
 * - available -> 0
 * - cleaning -> small fixed buffer
 * - occupied -> (avg dining duration - elapsed time since seated) + buffer
 * - reserved -> minutes until the reservation's time slot (if soon) else large number
 */
function estimateMinutesUntilFree(tableStatusDoc, now = new Date()) {
  const { status, currentParty } = tableStatusDoc;

  if (status === 'available') return 0;

  if (status === 'cleaning') return TABLE_BUFFER_MIN;

  if (status === 'occupied') {
    const avgDuration = tableStatusDoc.averageDiningDuration
      ? tableStatusDoc.averageDiningDuration(DEFAULT_DINING_DURATION_MIN)
      : DEFAULT_DINING_DURATION_MIN;
    const seatedAt = currentParty?.seatedAt ? new Date(currentParty.seatedAt) : now;
    const elapsedMin = Math.max(0, Math.round((now - seatedAt) / 60000));
    const remaining = Math.max(0, avgDuration - elapsedMin);
    return remaining + TABLE_BUFFER_MIN;
  }

  if (status === 'reserved') {
    // If we don't have the reservation start time loaded, fall back to a
    // conservative estimate rather than pretending we know.
    return 999;
  }

  return 999;
}

/**
 * Score a single table for a given party.
 * Returns { score, estimatedAvailableInMin, breakdown } or null if the
 * table can never fit the party (capacity too small).
 */
function scoreTable(table, tableStatusDoc, partySize, requestedZone) {
  if (table.capacity < partySize) return null;

  const estimatedAvailableInMin = estimateMinutesUntilFree(tableStatusDoc);

  const breakdown = {
    capacity: capacityScore(table.capacity, partySize),
    availability: availabilityScore(tableStatusDoc.status),
    waitTime: waitTimeScore(estimatedAvailableInMin),
    zone: zoneScore(table.zone, requestedZone),
  };

  const score = breakdown.capacity + breakdown.availability + breakdown.waitTime + breakdown.zone;

  return { score, estimatedAvailableInMin, breakdown };
}

/**
 * Rank all candidate tables for a party and return sorted recommendations.
 * `candidates` = array of { table, tableStatus } pairs (already loaded from DB).
 */
function rankTables(candidates, partySize, requestedZone) {
  const ranked = candidates
    .map(({ table, tableStatus }) => {
      const result = scoreTable(table, tableStatus, partySize, requestedZone);
      if (!result) return null;
      return {
        table,
        score: result.score,
        estimatedAvailableInMin: result.estimatedAvailableInMin,
        breakdown: result.breakdown,
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      // Higher score first; tie-break by soonest availability
      if (b.score !== a.score) return b.score - a.score;
      return a.estimatedAvailableInMin - b.estimatedAvailableInMin;
    });

  return ranked;
}

function buildRecommendationReason(top) {
  const { table, estimatedAvailableInMin, breakdown } = top;
  const parts = [];
  if (breakdown.capacity === 40) parts.push('ideal capacity fit');
  if (estimatedAvailableInMin <= 0) parts.push('available right now');
  else parts.push(`free in ~${estimatedAvailableInMin} min`);
  if (breakdown.zone === 10) parts.push('matches zone preference');
  return `Table ${table.tableNumber}: ${parts.join(', ')}.`;
}

module.exports = {
  rankTables,
  scoreTable,
  estimateMinutesUntilFree,
  buildRecommendationReason,
  DEFAULT_DINING_DURATION_MIN,
  TABLE_BUFFER_MIN,
};
