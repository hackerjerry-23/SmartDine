import { useEffect, useState } from 'react';
import api from '../services/api';
import { getSocket } from '../services/socket';
import { useAuth } from '../context/AuthContext';

const STATUS_STYLES = {
  pending: 'text-amber-400',
  confirmed: 'text-emerald-400',
  seated: 'text-sky-400',
  completed: 'text-stone-400',
  cancelled: 'text-rose-400',
  no_show: 'text-rose-400',
};

const TABLE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function Reservations() {
  const [form, setForm] = useState({ partySize: 2, timeSlot: '', durationMin: 60, tableNumber: 1 });
  const [mine, setMine] = useState([]);
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const load = () => api.get('/reservations/mine').then((res) => setMine(res.data));

  useEffect(() => {
    load();
    if (!user) return;
    const socket = getSocket();
    socket.emit('join', `customer:${user.id}`);
    socket.on('reservation:update', load);
    return () => socket.off('reservation:update', load);
  }, [user]);

  const submit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);
    try {
      const { data } = await api.post('/reservations', {
        ...form,
        partySize: Number(form.partySize),
        durationMin: Number(form.durationMin),
        tableNumber: Number(form.tableNumber),
      });
      if (data.allocation?.allocated) {
        setMessage({
          type: 'success',
          text: `Reservation confirmed! Table ${data.allocation.table.tableNumber} is ready for your party.`,
        });
      } else {
        setMessage({ type: 'success', text: 'Reservation requested — you will be notified once confirmed.' });
      }
      load();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Could not create reservation' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-8 rounded-3xl border border-stone-800 bg-gradient-to-r from-stone-900 to-stone-950 p-6 shadow-2xl shadow-black/20">
        <p className="text-brass text-xs uppercase tracking-[0.35em] font-mono">Reserve your table</p>
        <h1 className="text-3xl font-semibold text-stone-100 mt-2">Book a premium dining spot</h1>
        <p className="text-stone-400 mt-2">Choose your preferred date, time, guests, and table. We’ll keep your reservation secure and updated in real time.</p>
      </div>

      <form onSubmit={submit} className="rounded-3xl border border-stone-800 bg-stone-900 p-6 space-y-5 mb-8 shadow-xl shadow-black/20">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-stone-400 text-sm mb-1">Party size</label>
            <input
              type="number"
              min={1}
              value={form.partySize}
              onChange={(e) => setForm({ ...form, partySize: Number(e.target.value) })}
              className="w-full rounded-xl border border-stone-700 bg-stone-800 px-3 py-2 text-stone-100"
            />
          </div>
          <div>
            <label className="block text-stone-400 text-sm mb-1">Duration (min)</label>
            <input
              type="number"
              min={30}
              step={15}
              value={form.durationMin}
              onChange={(e) => setForm({ ...form, durationMin: Number(e.target.value) })}
              className="w-full rounded-xl border border-stone-700 bg-stone-800 px-3 py-2 text-stone-100"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-stone-400 text-sm mb-1">Date & time</label>
            <input
              type="datetime-local"
              required
              value={form.timeSlot}
              onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
              className="w-full rounded-xl border border-stone-700 bg-stone-800 px-3 py-2 text-stone-100"
            />
          </div>
          <div>
            <label className="block text-stone-400 text-sm mb-1">Preferred table</label>
            <select
              value={form.tableNumber}
              onChange={(e) => setForm({ ...form, tableNumber: Number(e.target.value) })}
              className="w-full rounded-xl border border-stone-700 bg-stone-800 px-3 py-2 text-stone-100"
            >
              {TABLE_OPTIONS.map((table) => (
                <option key={table} value={table}>Table {table}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-2xl border border-stone-800 bg-stone-950/70 p-4 text-sm text-stone-400">
          <p className="font-semibold text-stone-200">Reservation criteria</p>
          <p className="mt-2">We recommend selecting a table that fits your group size and preferred dining duration. If the table is unavailable, we’ll suggest the next best option automatically.</p>
        </div>

        {message && (
          <p className={`text-sm ${message.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>{message.text}</p>
        )}

        <button disabled={submitting} className="w-full rounded-xl bg-brass px-4 py-3 font-semibold text-stone-950 disabled:opacity-50">
          {submitting ? 'Requesting…' : 'Reserve table'}
        </button>
      </form>

      <div className="rounded-3xl border border-stone-800 bg-stone-900 p-6 shadow-xl shadow-black/20">
        <p className="text-brass text-xs tracking-widest uppercase font-mono mb-3">Your reservations</p>
        <div className="space-y-3">
          {mine.map((r) => (
            <div key={r._id} className="flex flex-col gap-2 rounded-2xl border border-stone-800 bg-stone-950/70 px-4 py-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-stone-100">{new Date(r.timeSlot).toLocaleString()} · Party of {r.partySize}</p>
                {r.table && <p className="text-sm text-stone-500">Table {r.table.tableNumber}</p>}
              </div>
              <span className={`text-xs font-mono uppercase ${STATUS_STYLES[r.status] || 'text-stone-400'}`}>
                {r.status.replace('_', ' ')}
              </span>
            </div>
          ))}
          {mine.length === 0 && <p className="text-stone-500 text-sm">No reservations yet.</p>}
        </div>
      </div>
    </div>
  );
}
