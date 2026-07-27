import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function Staff() {
  const [staff, setStaff] = useState([
    { _id: 'demo-staff-1', name: 'Asha Patel', email: 'asha@smartdine.ai', role: 'staff' },
    { _id: 'demo-staff-2', name: 'Rohan Das', email: 'rohan@smartdine.ai', role: 'staff' },
  ]);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => api.get('/users?role=staff').then((res) => {
    if (Array.isArray(res.data) && res.data.length) setStaff(res.data);
  }).catch(() => {});
  useEffect(() => { load(); }, []);

  const addStaff = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { data } = await api.post('/users', form);
      setStaff((prev) => [
        { _id: data.id || `${Date.now()}`, name: data.name || form.name, email: data.email || form.email, role: data.role || 'staff' },
        ...prev,
      ]);
      setForm({ name: '', email: '', password: '', phone: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add staff member');
    } finally {
      setBusy(false);
    }
  };

  const removeStaff = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      setStaff((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not remove staff member');
    }
  };

  const promote = async (id, role) => {
    try {
      await api.patch(`/users/${id}/role`, { role });
      setStaff((prev) => prev.map((item) => item._id === id ? { ...item, role } : item));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update role');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-stone-100 mb-6">Staff</h1>

      <form onSubmit={addStaff} className="grid gap-3 md:grid-cols-2 mb-6 rounded-2xl border border-stone-800 bg-stone-900 p-4 shadow-lg shadow-black/20">
        <input placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl bg-stone-950 border border-stone-700 px-3 py-2 text-stone-100 text-sm" />
        <input placeholder="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-xl bg-stone-950 border border-stone-700 px-3 py-2 text-stone-100 text-sm" />
        <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-xl bg-stone-950 border border-stone-700 px-3 py-2 text-stone-100 text-sm" />
        <input placeholder="Temp password" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="rounded-xl bg-stone-950 border border-stone-700 px-3 py-2 text-stone-100 text-sm" />
        {error && <p className="md:col-span-2 text-rose-400 text-sm">{error}</p>}
        <button disabled={busy} className="md:col-span-2 rounded-xl bg-brass hover:bg-brass-light text-stone-950 text-sm font-semibold py-2.5 disabled:opacity-50">
          {busy ? 'Adding…' : 'Add staff member'}
        </button>
      </form>

      <div className="space-y-2">
        {staff.map((s) => (
          <div key={s._id} className="flex flex-col gap-2 rounded-xl border border-stone-800 bg-stone-900 px-4 py-3 shadow-sm shadow-black/20 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-stone-100 text-sm">{s.name}</p>
              <p className="text-stone-500 text-xs">{s.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wide text-stone-500">{s.role || 'staff'}</span>
              <button onClick={() => promote(s._id, 'admin')} className="text-xs text-stone-400 hover:text-stone-200 underline underline-offset-2">
                Make admin
              </button>
              <button onClick={() => removeStaff(s._id)} className="text-xs text-rose-400 hover:text-rose-300">
                Remove
              </button>
            </div>
          </div>
        ))}
        {staff.length === 0 && <p className="text-stone-500 text-sm">No staff members yet.</p>}
      </div>
    </div>
  );
}
