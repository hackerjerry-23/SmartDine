const asyncHandler = require('express-async-handler');
const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const TableStatus = require('../models/TableStatus');
const { rankTables, buildRecommendationReason } = require('../utils/tableOptimizer');
const { getIO } = require('../utils/socket');
const { sendEmail } = require('../utils/email');

/**
 * Runs the Smart Table Optimizer for a reservation's party size and, if a
 * table can seat them, attaches it and auto-confirms the booking. This is
 * what makes "Request reservation" actually turn into a real confirmation
 * instead of sitting at 'pending' forever with nobody ever notified.
 */
async function tryAutoAllocate(reservation) {
  const tables = await Table.find({ isActive: true });
  const statuses = await TableStatus.find({ table: { $in: tables.map((t) => t._id) } });
  const statusByTable = new Map(statuses.map((s) => [String(s.table), s]));

  const candidates = tables
    .map((table) => ({ table, tableStatus: statusByTable.get(String(table._id)) }))
    .filter((c) => c.tableStatus);

  const ranked = rankTables(candidates, reservation.partySize, null);
  if (ranked.length === 0) return { allocated: false, reason: 'No table can currently seat this party size.' };

  const top = ranked[0];
  reservation.table = top.table._id;
  reservation.status = 'confirmed';
  await reservation.save();

  return { allocated: true, table: top.table, reason: buildRecommendationReason(top) };
}

function notifyReservationUpdate(reservation) {
  const io = getIO();
  io?.to('admin').emit('reservation:update', { reservationId: reservation._id, status: reservation.status });
  if (reservation.customer) {
    io?.to(`customer:${reservation.customer}`).emit('reservation:update', {
      reservationId: reservation._id,
      status: reservation.status,
    });
  }
}

async function emailReservationStatus(reservation, user, extra = '') {
  if (!user?.email) return;
  const when = new Date(reservation.timeSlot).toLocaleString();
  const subjectByStatus = {
    confirmed: 'Your reservation is confirmed!',
    cancelled: 'Your reservation was cancelled',
    seated: "You're seated - enjoy your meal!",
    completed: 'Thanks for dining with us',
    no_show: 'We missed you',
    pending: 'Reservation received',
  };

  await sendEmail({
    to: user.email,
    subject: subjectByStatus[reservation.status] || 'Reservation update',
    text: `Hi ${user.name || ''}, your reservation for ${reservation.partySize} on ${when} is now "${reservation.status}". ${extra}`,
  }).catch((e) => console.error('Reservation email failed:', e.message));
}

const createReservation = asyncHandler(async (req, res) => {
  const { partySize, timeSlot, durationMin } = req.body;

  if (!partySize || !timeSlot) {
    res.status(400);
    throw new Error('partySize and timeSlot are required');
  }

  const reservation = await Reservation.create({
    customer: req.user._id, partySize, timeSlot, durationMin: durationMin || 60,
  });

  const result = await tryAutoAllocate(reservation);
  await reservation.populate('table');

  notifyReservationUpdate(reservation);

  if (result.allocated) {
    await emailReservationStatus(
      reservation,
      req.user,
      `Table ${result.table.tableNumber} has been reserved for you. ${result.reason}`
    );
  } else {
    await emailReservationStatus(
      reservation,
      req.user,
      'Our team will confirm your table shortly and notify you by email.'
    );
  }

  res.status(201).json({ ...reservation.toObject(), allocation: result });
});

const getMyReservations = asyncHandler(async (req, res) => {
  res.json(await Reservation.find({ customer: req.user._id }).populate('table').sort({ timeSlot: 1 }));
});

const getAllReservations = asyncHandler(async (req, res) => {
  res.json(await Reservation.find().populate('customer', 'name email').populate('table').sort({ timeSlot: 1 }));
});

const updateReservationStatus = asyncHandler(async (req, res) => {
  const { status, tableId } = req.body;
  const r = await Reservation.findById(req.params.id).populate('customer', 'name email');
  if (!r) { res.status(404); throw new Error('Reservation not found'); }

  if (tableId) r.table = tableId;
  r.status = status;
  await r.save();
  await r.populate('table');

  // Bring the physical table state in line with the reservation so the
  // floor map / optimizer stay accurate.
  if (status === 'seated' && r.table) {
    const tableStatus = await TableStatus.findOne({ table: r.table._id });
    if (tableStatus) {
      tableStatus.status = 'occupied';
      tableStatus.currentParty = { size: r.partySize, seatedAt: new Date(), reservation: r._id };
      tableStatus.lastStatusChangeAt = new Date();
      await tableStatus.save();
      getIO()?.emit('table:status-changed', { tableId: r.table._id, status: 'occupied' });
    }
  }

  notifyReservationUpdate(r);
  await emailReservationStatus(r, r.customer);

  res.json(r);
});

module.exports = { createReservation, getMyReservations, getAllReservations, updateReservationStatus };
