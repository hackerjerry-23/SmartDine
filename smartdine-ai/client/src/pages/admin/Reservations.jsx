import { useEffect, useState } from 'react';
import api from '../../services/api';
import { getSocket } from '../../services/socket';

const STATUS_STYLES = {
  pending: 'bg-amber-500/15 text-amber-400',
  confirmed: 'bg-emerald-500/15 text-emerald-400',
  seated: 'bg-sky-500/15 text-sky-400',
  completed: 'bg-stone-700/40 text-stone-300',
  cancelled: 'bg-rose-500/15 text-rose-400',
  no_show: 'bg-rose-500/15 text-rose-400',
};

export default function AdminReservations() {
  const [reservations, setReservations] = useState([
    {
      _id: 'demo-res-1',
      customer: { name: 'Mina Shah' },
      partySize: 4,
      timeSlot: '2026-07-27T19:00:00.000Z',
      status: 'confirmed',
      table: { tableNumber: 7 },
    },
    {
      _id: 'demo-res-2',
      customer: { name: 'Arjun Singh' },
      partySize: 2,
      timeSlot: '2026-07-27T20:30:00.000Z',
      status: 'pending',
      table: null,
    },
    {
      _id: 'demo-res-3',
      customer: { name: 'Leela Verma' },
      partySize: 6,
      timeSlot: '2026-07-27T21:00:00.000Z',
      status: 'seated',
      table: { tableNumber: 3 },
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .get('/reservations')
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length) {
          setReservations(res.data);
        }
      })
      .catch((err) => setError(err.response?.data?.message || 'Could not load reservations'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const socket = getSocket();
    socket.emit('join', 'admin');
    socket.on('reservation:update', load);
    return () => socket.off('reservation:update', load);
  }, []);

  const setStatus = async (id, status) => {
    setBusyId(id);
    try {
      await api.patch(`/reservations/${id}/status`, { status });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update reservation');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-stone-100 mb-6">Reservations</h1>

      {error && (
        <div className="mb-4 rounded-md border border-rose-900/50 bg-rose-950/20 px-4 py-2 text-rose-400 text-sm">
          {error}
        </div>
      )}

      {loading && <p className="text-stone-500 text-sm">Loading reservations…</p>}

      {!loading && reservations.length === 0 && (
        <p className="text-stone-500 text-sm">No reservations yet.</p>
      )}

      <div className="space-y-2">
        {reservations.map((r) => (
          <div
            key={r._id}
            className="flex items-center justify-between gap-4 rounded-md border border-stone-800 bg-stone-900 px-4 py-3"
          >
            <div className="min-w-0">
              <p className="text-stone-100 text-sm font-medium">
                {r.customer?.name || 'Guest'} · party of {r.partySize}
              </p>
              <p className="text-stone-500 text-xs font-mono">
                {new Date(r.timeSlot).toLocaleString()}
                {r.table ? ` · Table ${r.table.tableNumber} (AI-assigned)` : ' · No table assigned yet'}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-[10px] font-mono uppercase px-2 py-1 rounded ${STATUS_STYLES[r.status] || ''}`}>
                {r.status.replace('_', ' ')}
              </span>

              {r.status === 'pending' && (
                <button
                  disabled={busyId === r._id}
                  onClick={() => setStatus(r._id, 'confirmed')}
                  className="rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-semibold px-3 py-1.5 disabled:opacity-50"
                >
                  Confirm
                </button>
              )}
              {['pending', 'confirmed'].includes(r.status) && (
                <button
                  disabled={busyId === r._id}
                  onClick={() => setStatus(r._id, 'seated')}
                  className="rounded-md bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 text-xs font-semibold px-3 py-1.5 disabled:opacity-50"
                >
                  Mark seated
                </button>
              )}
              {!['completed', 'cancelled', 'no_show'].includes(r.status) && (
                <button
                  disabled={busyId === r._id}
                  onClick={() => setStatus(r._id, 'cancelled')}
                  className="rounded-md bg-rose-950/40 hover:bg-rose-950/60 border border-rose-900/50 text-rose-400 text-xs font-semibold px-3 py-1.5 disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
