import { useState } from 'react';
import api from '../../services/api';

export default function JoinQueueForm({ onJoined }) {
  const [form, setForm] = useState({ guestName: '', guestPhone: '', partySize: 2 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/queue/join', form);
      onJoined(data.queueId);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not join the queue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="max-w-sm rounded-lg border border-stone-700 bg-stone-900 p-5 space-y-4">
      <p className="text-[#c99a5c] text-xs tracking-widest uppercase font-mono">Join the waitlist</p>

      <div>
        <label className="block text-stone-400 text-sm mb-1">Name</label>
        <input
          required
          value={form.guestName}
          onChange={(e) => setForm({ ...form, guestName: e.target.value })}
          className="w-full rounded-md bg-stone-800 border border-stone-700 px-3 py-2 text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#b5813f]"
        />
      </div>

      <div>
        <label className="block text-stone-400 text-sm mb-1">Phone</label>
        <input
          required
          value={form.guestPhone}
          onChange={(e) => setForm({ ...form, guestPhone: e.target.value })}
          className="w-full rounded-md bg-stone-800 border border-stone-700 px-3 py-2 text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#b5813f]"
        />
      </div>

      <div>
        <label className="block text-stone-400 text-sm mb-1">Party size</label>
        <input
          type="number"
          min={1}
          required
          value={form.partySize}
          onChange={(e) => setForm({ ...form, partySize: Number(e.target.value) })}
          className="w-full rounded-md bg-stone-800 border border-stone-700 px-3 py-2 text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#b5813f]"
        />
      </div>

      {error && <p className="text-rose-400 text-sm">{error}</p>}

      <button
        disabled={loading}
        className="w-full rounded-md bg-[#b5813f] hover:bg-[#c99a5c] disabled:opacity-50 text-stone-950 font-semibold py-2 transition-colors"
      >
        {loading ? 'Joining…' : 'Join queue'}
      </button>
    </form>
  );
}
