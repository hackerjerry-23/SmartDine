const asyncHandler = require('express-async-handler');
const Queue = require('../models/Queue');
const Table = require('../models/Table');
const TableStatus = require('../models/TableStatus');
const { estimateWaitTime, computeQueuePosition } = require('../utils/queueEstimator');
const { getIO } = require('../utils/socket');
const { sendEmail } = require('../utils/email');

const NOTIFY_GRACE_PERIOD_MIN = 5;

async function getWaitingQueue() {
  return Queue.find({ status: { $in: ['waiting', 'notified'] } }).sort({ joinedAt: 1 });
}

async function getQueueEntryWithCustomer(id) {
  return Queue.findById(id).populate('customer', 'name email');
}

async function getLiveTableStatuses() {
  return TableStatus.find().populate('table');
}

/**
 * Recompute and broadcast every waiting party's position + wait estimate.
 * Called whenever the queue changes (join/leave/seat/table freed).
 */
async function refreshQueueBroadcast() {
  const waiting = await getWaitingQueue();
  const tableStatuses = await getLiveTableStatuses();
  const io = getIO();

  for (let i = 0; i < waiting.length; i++) {
    const entry = waiting[i];
    const ahead = waiting.slice(0, i);
    const estWait = estimateWaitTime(tableStatuses, ahead, entry.partySize);

    io?.to(`queue:${entry._id}`).emit('queue:update', {
      queueId: entry._id,
      position: i + 1,
      partiesAhead: i,
      estimatedWaitMin: estWait,
    });
  }

  io?.to('admin').emit('queue:dashboard-update', {
    totalWaiting: waiting.length,
  });
}

/**
 * POST /api/queue/join
 * Body: { guestName, guestPhone, partySize, zonePreference?, customerId? }
 */
const joinQueue = asyncHandler(async (req, res) => {
  const { guestName, guestPhone, partySize, zonePreference, customerId } = req.body;

  if (!guestName || !guestPhone || !partySize) {
    res.status(400);
    throw new Error('guestName, guestPhone and partySize are required');
  }

  const waiting = await getWaitingQueue();
  const tableStatuses = await getLiveTableStatuses();
  const initialEstimatedWaitMin = estimateWaitTime(tableStatuses, waiting, partySize);

  const entry = await Queue.create({
    customer: customerId || null,
    guestName,
    guestPhone,
    partySize,
    zonePreference: zonePreference || null,
    initialEstimatedWaitMin,
  });

  await refreshQueueBroadcast();

  const position = waiting.length + 1;
  res.status(201).json({
    queueId: entry._id,
    position,
    partiesAhead: waiting.length,
    estimatedWaitMin: initialEstimatedWaitMin,
  });
});

/**
 * GET /api/queue/status/:id
 * Poll-friendly endpoint (in addition to the socket push) for a queue entry.
 */
const getQueueStatus = asyncHandler(async (req, res) => {
  const entry = await Queue.findById(req.params.id);
  if (!entry) {
    res.status(404);
    throw new Error('Queue entry not found');
  }

  if (!['waiting', 'notified'].includes(entry.status)) {
    return res.json({ queueId: entry._id, status: entry.status });
  }

  const waiting = await getWaitingQueue();
  const idx = waiting.findIndex((q) => String(q._id) === String(entry._id));
  const ahead = waiting.slice(0, idx);
  const tableStatuses = await getLiveTableStatuses();
  const estimatedWaitMin = estimateWaitTime(tableStatuses, ahead, entry.partySize);

  res.json({
    queueId: entry._id,
    status: entry.status,
    position: idx + 1,
    partiesAhead: ahead.length,
    estimatedWaitMin,
  });
});

/**
 * GET /api/queue/status  (admin - full dashboard list)
 */
const getFullQueue = asyncHandler(async (req, res) => {
  const waiting = await getWaitingQueue();
  const tableStatuses = await getLiveTableStatuses();

  const enriched = waiting.map((entry, i) => ({
    ...entry.toObject(),
    position: i + 1,
    estimatedWaitMin: estimateWaitTime(tableStatuses, waiting.slice(0, i), entry.partySize),
  }));

  res.json(enriched);
});

/**
 * PATCH /api/queue/leave/:id
 * Customer cancels or postpones their spot.
 */
const leaveQueue = asyncHandler(async (req, res) => {
  const { reason } = req.body; // e.g. 'cancelled' | 'postponed' - both free the slot
  const entry = await Queue.findById(req.params.id);
  if (!entry) {
    res.status(404);
    throw new Error('Queue entry not found');
  }

  entry.status = 'cancelled';
  entry.cancelledAt = new Date();
  await entry.save();

  await refreshQueueBroadcast();
  res.json({ queueId: entry._id, status: entry.status, reason: reason || null });
});

/**
 * POST /api/queue/notify/:id
 * Staff (or an automated job watching table availability) marks a party as
 * "your table is ready" - starts the grace-period countdown.
 */
const notifyQueueEntry = asyncHandler(async (req, res) => {
  const { tableId } = req.body;
  const entry = await getQueueEntryWithCustomer(req.params.id);
  if (!entry) {
    res.status(404);
    throw new Error('Queue entry not found');
  }

  entry.status = 'notified';
  entry.notifiedAt = new Date();
  entry.expiresAt = new Date(Date.now() + NOTIFY_GRACE_PERIOD_MIN * 60000);
  entry.assignedTable = tableId || null;
  await entry.save();

  const io = getIO();
  io?.to(`queue:${entry._id}`).emit('queue:notified', {
    queueId: entry._id,
    message: `Table ${tableId ? '' : ''}is now ready. Please proceed within the next ${NOTIFY_GRACE_PERIOD_MIN} minutes.`,
    expiresAt: entry.expiresAt,
  });

  // Browser notification is pushed via socket above; email is a fallback
  // channel for guests without the tab open. Only registered customers
  // have an email on file - guest walk-ins are guestPhone-only.
  if (entry.customer?.email) {
    sendEmail({
      to: entry.customer.email,
      subject: 'Your table is ready!',
      text: `Hi ${entry.guestName}, your table is ready. Please check in within ${NOTIFY_GRACE_PERIOD_MIN} minutes.`,
    }).catch((e) => console.error('Notify email failed:', e.message));
  }

  // Auto-expire if they don't check in within the grace period
  setTimeout(async () => {
    const fresh = await Queue.findById(entry._id);
    if (fresh && fresh.status === 'notified') {
      fresh.status = 'expired';
      await fresh.save();
      getIO()?.to(`queue:${fresh._id}`).emit('queue:expired', { queueId: fresh._id });
      await refreshQueueBroadcast();
    }
  }, NOTIFY_GRACE_PERIOD_MIN * 60000);

  res.json(entry);
});

/**
 * PATCH /api/queue/seat/:id
 * Customer has checked in and been seated - closes out the queue entry.
 */
const seatQueueEntry = asyncHandler(async (req, res) => {
  const entry = await Queue.findById(req.params.id);
  if (!entry) {
    res.status(404);
    throw new Error('Queue entry not found');
  }
  entry.status = 'seated';
  entry.seatedAt = new Date();
  await entry.save();

  await refreshQueueBroadcast();
  res.json(entry);
});

module.exports = {
  joinQueue,
  getQueueStatus,
  getFullQueue,
  leaveQueue,
  notifyQueueEntry,
  seatQueueEntry,
  refreshQueueBroadcast,
};
