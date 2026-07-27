const asyncHandler = require('express-async-handler');
const Table = require('../models/Table');
const TableStatus = require('../models/TableStatus');
const TableAllocation = require('../models/TableAllocation');
const { rankTables, buildRecommendationReason, estimateMinutesUntilFree } = require('../utils/tableOptimizer');
const { getIO } = require('../utils/socket');

/**
 * GET /api/tables/status
 * Live status of every table - powers the admin "Live Restaurant Floor Map".
 */
const getAllTableStatuses = asyncHandler(async (req, res) => {
  const statuses = await TableStatus.find()
    .populate('table')
    .populate('currentParty.order')
    .populate('currentParty.reservation');

  res.json(
    statuses.map((s) => ({
      id: s._id,
      table: s.table,
      status: s.status,
      currentParty: s.currentParty,
      estimatedFreeAt: s.estimatedFreeAt,
      estimatedMinutesUntilFree: estimateMinutesUntilFree(s),
    }))
  );
});

/**
 * POST /api/tables/allocate
 * Body: { partySize, zonePreference?, customerId? }
 * Runs the Smart Table Optimizer and returns a ranked recommendation.
 * Also logs the suggestion to TableAllocation for later analytics/audit.
 */
const allocateTable = asyncHandler(async (req, res) => {
  const { partySize, zonePreference, customerId } = req.body;

  if (!partySize || partySize < 1) {
    res.status(400);
    throw new Error('partySize is required and must be at least 1');
  }

  const tables = await Table.find({ isActive: true });
  const statuses = await TableStatus.find({ table: { $in: tables.map((t) => t._id) } });
  const statusByTable = new Map(statuses.map((s) => [String(s.table), s]));

  const candidates = tables
    .map((table) => ({ table, tableStatus: statusByTable.get(String(table._id)) }))
    .filter((c) => c.tableStatus); // skip tables with no status doc yet

  const ranked = rankTables(
    candidates.map((c) => ({ table: c.table, tableStatus: c.tableStatus })),
    Number(partySize),
    zonePreference || null
  );

  if (ranked.length === 0) {
    res.status(404);
    throw new Error('No table can accommodate this party size right now');
  }

  const top = ranked[0];
  const alternatives = ranked.slice(1, 4); // next 3 options for staff to consider

  const allocation = await TableAllocation.create({
    customer: customerId || null,
    partySize,
    requestedZone: zonePreference || null,
    recommendedTable: top.table._id,
    recommendationScore: top.score,
    recommendationReason: buildRecommendationReason(top),
    estimatedAvailableInMin: top.estimatedAvailableInMin,
    alternatives: alternatives.map((a) => ({
      table: a.table._id,
      score: a.score,
      estimatedAvailableInMin: a.estimatedAvailableInMin,
    })),
    status: 'suggested',
  });

  // Push live update to admin dashboards watching the floor map
  getIO()?.to('admin').emit('table:allocation-suggested', { allocationId: allocation._id });

  res.status(201).json({
    allocationId: allocation._id,
    recommended: {
      table: top.table,
      score: top.score,
      estimatedAvailableInMin: top.estimatedAvailableInMin,
      reason: buildRecommendationReason(top),
      breakdown: top.breakdown,
    },
    alternatives: alternatives.map((a) => ({
      table: a.table,
      score: a.score,
      estimatedAvailableInMin: a.estimatedAvailableInMin,
    })),
  });
});

/**
 * PATCH /api/tables/allocate/:id/override
 * Staff manually pick a different table than the AI suggested.
 * Body: { finalTableId, reason? }
 */
const overrideAllocation = asyncHandler(async (req, res) => {
  const { finalTableId, reason } = req.body;
  const allocation = await TableAllocation.findById(req.params.id);

  if (!allocation) {
    res.status(404);
    throw new Error('Allocation not found');
  }

  allocation.finalTable = finalTableId;
  allocation.wasOverridden = String(finalTableId) !== String(allocation.recommendedTable);
  allocation.overriddenBy = req.user._id;
  allocation.overrideReason = reason || null;
  allocation.status = 'confirmed';
  await allocation.save();

  res.json(allocation);
});

/**
 * POST /api/tables/allocate/:id/confirm
 * Staff/system confirms the AI's own recommendation (no override).
 */
const confirmAllocation = asyncHandler(async (req, res) => {
  const allocation = await TableAllocation.findById(req.params.id);
  if (!allocation) {
    res.status(404);
    throw new Error('Allocation not found');
  }
  allocation.finalTable = allocation.recommendedTable;
  allocation.wasOverridden = false;
  allocation.status = 'confirmed';
  await allocation.save();
  res.json(allocation);
});

/**
 * PATCH /api/tables/:tableId/seat
 * Marks a table occupied once the party sits down - starts the dining timer
 * that later predictions are based on.
 */
const seatTable = asyncHandler(async (req, res) => {
  const { partySize, orderId, reservationId } = req.body;
  const status = await TableStatus.findOne({ table: req.params.tableId });
  if (!status) {
    res.status(404);
    throw new Error('Table status not found');
  }

  status.status = 'occupied';
  status.currentParty = {
    size: partySize,
    seatedAt: new Date(),
    order: orderId || null,
    reservation: reservationId || null,
  };
  status.lastStatusChangeAt = new Date();
  await status.save();

  getIO()?.emit('table:status-changed', { tableId: req.params.tableId, status: 'occupied' });
  res.json(status);
});

/**
 * PATCH /api/tables/:tableId/clear
 * Party leaves - table goes to 'cleaning', and we record the actual dining
 * duration into history so future predictions improve over time.
 */
const clearTable = asyncHandler(async (req, res) => {
  const status = await TableStatus.findOne({ table: req.params.tableId });
  if (!status) {
    res.status(404);
    throw new Error('Table status not found');
  }

  if (status.currentParty?.seatedAt) {
    const durationMin = Math.round((Date.now() - new Date(status.currentParty.seatedAt)) / 60000);
    status.diningHistoryMin.push(durationMin);
    if (status.diningHistoryMin.length > 50) status.diningHistoryMin.shift(); // cap history size
  }

  status.status = 'cleaning';
  status.currentParty = { size: 0, seatedAt: null, order: null, reservation: null };
  status.lastStatusChangeAt = new Date();
  await status.save();

  getIO()?.emit('table:status-changed', { tableId: req.params.tableId, status: 'cleaning' });

  // Auto-transition cleaning -> available after the buffer window
  const { TABLE_BUFFER_MIN } = require('../utils/tableOptimizer');
  setTimeout(async () => {
    const fresh = await TableStatus.findOne({ table: req.params.tableId });
    if (fresh && fresh.status === 'cleaning') {
      fresh.status = 'available';
      fresh.lastStatusChangeAt = new Date();
      await fresh.save();
      getIO()?.emit('table:status-changed', { tableId: req.params.tableId, status: 'available' });
    }
  }, TABLE_BUFFER_MIN * 60 * 1000);

  res.json(status);
});

/**
 * GET /api/tables/predict-availability/:tableId
 * Standalone endpoint for "when will this specific table be free".
 */
const predictAvailability = asyncHandler(async (req, res) => {
  const status = await TableStatus.findOne({ table: req.params.tableId }).populate('table');
  if (!status) {
    res.status(404);
    throw new Error('Table status not found');
  }
  const minutes = estimateMinutesUntilFree(status);
  res.json({
    table: status.table,
    status: status.status,
    estimatedMinutesUntilFree: minutes,
    estimatedFreeAt: new Date(Date.now() + minutes * 60000),
  });
});

module.exports = {
  getAllTableStatuses,
  allocateTable,
  overrideAllocation,
  confirmAllocation,
  seatTable,
  clearTable,
  predictAvailability,
};
