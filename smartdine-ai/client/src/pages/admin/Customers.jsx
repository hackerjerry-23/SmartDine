import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function Customers() {
  const [customers, setCustomers] = useState([
    { _id: 'demo-customer-1', name: 'Neha Sharma', email: 'neha@example.com', phone: '+91 98765 43210', createdAt: '2026-01-12T10:30:00.000Z' },
    { _id: 'demo-customer-2', name: 'Ravi Kumar', email: 'ravi@example.com', phone: '+91 91234 56789', createdAt: '2026-03-08T16:20:00.000Z' },
    { _id: 'demo-customer-3', name: 'Priya Menon', email: 'priya@example.com', phone: '+91 99887 66554', createdAt: '2026-06-02T09:45:00.000Z' },
  ]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/users?role=customer').then((res) => {
      if (Array.isArray(res.data) && res.data.length) setCustomers(res.data);
    }).catch(() => {});
  }, []);

  const filtered = customers.filter((c) => (c.name || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-100">Customers</h1>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          className="rounded-md bg-stone-900 border border-stone-700 px-3 py-2 text-sm text-stone-100"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((c) => (
          <div key={c._id} className="flex items-center justify-between rounded-md border border-stone-800 bg-stone-900 px-4 py-3">
            <div>
              <p className="text-stone-100 text-sm">{c.name}</p>
              <p className="text-stone-500 text-xs">{c.email}{c.phone ? ` · ${c.phone}` : ''}</p>
            </div>
            <span className="text-stone-500 text-xs font-mono">
              Joined {new Date(c.createdAt).toLocaleDateString()}
            </span>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-stone-500 text-sm">No customers found.</p>}
      </div>
    </div>
  );
}
