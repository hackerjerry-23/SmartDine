import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', unit: 'L', quantityAvailable: 0, alertThreshold: 0 });
  const [predictions, setPredictions] = useState(null);
  const [predicting, setPredicting] = useState(false);

  const load = () => api.get('/inventory').then((res) => setItems(res.data));
  useEffect(() => { load(); }, []);

  const addItem = async (e) => {
    e.preventDefault();
    await api.post('/inventory', form);
    setForm({ name: '', unit: 'L', quantityAvailable: 0, alertThreshold: 0 });
    load();
  };

  const updateQty = async (id, quantityAvailable) => {
    await api.put(`/inventory/${id}`, { quantityAvailable });
    load();
  };

  const runPrediction = async () => {
    setPredicting(true);
    try {
      const { data } = await api.post('/ai/inventory-predict');
      setPredictions(data.warnings || []);
    } finally {
      setPredicting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-100">Inventory</h1>
        <button
          onClick={runPrediction}
          disabled={predicting}
          className="rounded-md bg-brass hover:bg-brass-light disabled:opacity-50 text-stone-950 text-sm font-semibold px-4 py-2"
        >
          {predicting ? 'Predicting…' : 'Run AI stock prediction'}
        </button>
      </div>

      {predictions && (
        <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
          <p className="text-amber-400 text-xs tracking-widest uppercase font-mono mb-2">Predicted shortages</p>
          {predictions.length === 0 ? (
            <p className="text-stone-400 text-sm">No shortages predicted in the next 2 days.</p>
          ) : (
            <ul className="text-sm text-stone-300 space-y-1">
              {predictions.map((p, i) => (
                <li key={i}>{p.item} — runs out ~{p.willRunOutOn}, reorder {p.suggestedReorderQty}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <form onSubmit={addItem} className="grid grid-cols-5 gap-2 mb-6">
        <input placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="col-span-2 rounded-md bg-stone-900 border border-stone-700 px-3 py-2 text-stone-100 text-sm" />
        <input placeholder="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="rounded-md bg-stone-900 border border-stone-700 px-3 py-2 text-stone-100 text-sm" />
        <input type="number" placeholder="Qty" value={form.quantityAvailable} onChange={(e) => setForm({ ...form, quantityAvailable: Number(e.target.value) })} className="rounded-md bg-stone-900 border border-stone-700 px-3 py-2 text-stone-100 text-sm" />
        <input type="number" placeholder="Alert at" value={form.alertThreshold} onChange={(e) => setForm({ ...form, alertThreshold: Number(e.target.value) })} className="rounded-md bg-stone-900 border border-stone-700 px-3 py-2 text-stone-100 text-sm" />
        <button className="col-span-5 rounded-md bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 text-sm font-semibold py-2">
          Add item
        </button>
      </form>

      <div className="space-y-2">
        {items.map((item) => {
          const low = item.quantityAvailable <= item.alertThreshold;
          return (
            <div key={item._id} className={`flex items-center justify-between rounded-md border px-4 py-3 ${low ? 'border-rose-500/40 bg-rose-500/5' : 'border-stone-800 bg-stone-900'}`}>
              <span className="text-stone-100 text-sm">{item.name}</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  defaultValue={item.quantityAvailable}
                  onBlur={(e) => updateQty(item._id, Number(e.target.value))}
                  className="w-20 rounded bg-stone-800 border border-stone-700 px-2 py-1 text-stone-100 text-sm"
                />
                <span className="text-stone-500 text-xs">{item.unit}</span>
                {low && <span className="text-rose-400 text-xs font-mono uppercase">Low</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
