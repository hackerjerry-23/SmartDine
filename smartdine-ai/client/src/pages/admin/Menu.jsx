import { useEffect, useState } from 'react';
import api from '../../services/api';

const EMPTY_FORM = { name: '', description: '', price: '', category: '', imageUrl: '', tags: '' };

export default function AdminMenu() {
  const [items, setItems] = useState([
    { _id: 'demo-1', name: 'Paneer Tikka', category: 'Starters', description: 'Smoky grilled paneer skewers', price: 240, imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80', isAvailable: true, tags: ['veg', 'popular'] },
    { _id: 'demo-2', name: 'Chicken Biryani', category: 'Biryani', description: 'Flavourful biryani with tender chicken', price: 320, imageUrl: 'https://images.unsplash.com/photo-1599043513900-ed6fe01d3833?auto=format&fit=crop&w=900&q=80', isAvailable: true, tags: ['bestseller'] },
    { _id: 'demo-3', name: 'Margherita Pizza', category: 'Pizza', description: 'Classic pizza with mozzarella', price: 280, imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80', isAvailable: true, tags: ['veg'] },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get('/menu')
      .then((res) => setItems(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load menu items'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setForm({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category,
      imageUrl: item.imageUrl || '',
      tags: (item.tags || []).join(', '),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      category: form.category.trim().toLowerCase(),
      imageUrl: form.imageUrl.trim(),
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };

    try {
      if (editingId) {
        await api.put(`/menu/${editingId}`, payload);
      } else {
        await api.post('/menu', payload);
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save this item');
    } finally {
      setSaving(false);
    }
  };

  const toggleAvailability = async (item) => {
    await api.patch(`/menu/${item._id}/availability`, { isAvailable: !item.isAvailable });
    setItems((prev) => prev.map((i) => (i._id === item._id ? { ...i, isAvailable: !i.isAvailable } : i)));
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this menu item? This cannot be undone.')) return;
    await api.delete(`/menu/${id}`);
    if (editingId === id) resetForm();
    load();
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-stone-100 mb-6">Menu management</h1>

      {error && (
        <div className="mb-4 rounded-md border border-rose-900/50 bg-rose-950/20 px-4 py-2 text-rose-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="rounded-lg border border-stone-800 bg-stone-900 p-5 mb-8 space-y-3">
        <p className="text-brass text-xs tracking-widest uppercase font-mono">
          {editingId ? 'Edit item' : 'Add a new dish'}
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            placeholder="Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-md bg-stone-800 border border-stone-700 px-3 py-2 text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-brass"
          />
          <input
            placeholder="Category (e.g. mains, desserts)"
            required
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="rounded-md bg-stone-800 border border-stone-700 px-3 py-2 text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-brass"
          />
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Price (₹)"
            required
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="rounded-md bg-stone-800 border border-stone-700 px-3 py-2 text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-brass"
          />
          <input
            placeholder="Image URL (optional)"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            className="rounded-md bg-stone-800 border border-stone-700 px-3 py-2 text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-brass"
          />
        </div>
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={2}
          className="w-full rounded-md bg-stone-800 border border-stone-700 px-3 py-2 text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-brass"
        />
        <input
          placeholder="Tags, comma separated (e.g. veg, spicy, bestseller)"
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          className="w-full rounded-md bg-stone-800 border border-stone-700 px-3 py-2 text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-brass"
        />
        <div className="flex gap-2">
          <button
            disabled={saving}
            className="rounded-md bg-brass hover:bg-brass-light disabled:opacity-50 text-stone-950 font-semibold px-4 py-2 text-sm"
          >
            {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add item'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-md bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 text-sm font-semibold px-4 py-2"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading && <p className="text-stone-500 text-sm">Loading menu…</p>}

      {!loading && items.length === 0 && (
        <p className="text-stone-500 text-sm">No dishes yet. Add your first item above.</p>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <div key={item._id} className="overflow-hidden rounded-xl border border-stone-800 bg-stone-900 shadow-lg shadow-black/20">
            {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="h-28 w-full object-cover" />}
            <div className="flex items-start justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="text-stone-100 text-sm font-medium truncate">{item.name}</p>
                <p className="text-stone-500 text-xs">{item.category} · ₹{item.price}</p>
                {item.description && <p className="text-stone-500 text-xs mt-1">{item.description}</p>}
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button
                  onClick={() => toggleAvailability(item)}
                  className={`text-[10px] font-mono uppercase px-2 py-1 rounded ${item.isAvailable ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}
                >
                  {item.isAvailable ? 'Available' : 'Out of stock'}
                </button>
                <button onClick={() => startEdit(item)} className="rounded-md bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 text-xs font-semibold px-3 py-1.5">Edit</button>
                <button onClick={() => remove(item._id)} className="rounded-md bg-rose-950/40 hover:bg-rose-950/60 border border-rose-900/50 text-rose-400 text-xs font-semibold px-3 py-1.5">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
