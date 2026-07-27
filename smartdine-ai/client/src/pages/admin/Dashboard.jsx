import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../../services/api';

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-stone-800 bg-stone-900 p-5 shadow-lg shadow-black/20">
      <p className="text-stone-500 text-xs uppercase tracking-wide mb-1">{label}</p>
      <p className="text-stone-100 text-2xl font-bold font-mono">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState({ totalSales: 18450, todaysOrders: 24 });
  const [salesTrend, setSalesTrend] = useState([
    { _id: 'Mon', total: 2200 },
    { _id: 'Tue', total: 3100 },
    { _id: 'Wed', total: 2800 },
    { _id: 'Thu', total: 3600 },
    { _id: 'Fri', total: 4200 },
    { _id: 'Sat', total: 5000 },
    { _id: 'Sun', total: 2550 },
  ]);
  const [mostOrdered, setMostOrdered] = useState([
    { _id: 'Chicken Biryani', quantity: 42 },
    { _id: 'Paneer Tikka', quantity: 31 },
    { _id: 'Butter Chicken', quantity: 28 },
    { _id: 'Margherita Pizza', quantity: 24 },
  ]);
  const [tables, setTables] = useState([
    { status: 'available' },
    { status: 'reserved' },
    { status: 'occupied' },
    { status: 'available' },
  ]);
  const [alerts, setAlerts] = useState([
    { _id: 1, name: 'Milk', quantityAvailable: 6, unit: 'L', alertThreshold: 10 },
    { _id: 2, name: 'Chicken', quantityAvailable: 2, unit: 'kg', alertThreshold: 5 },
  ]);

  useEffect(() => {
    api.get('/analytics/summary').then((res) => setSummary((prev) => ({ ...prev, ...res.data }))).catch(() => {});
    api.get('/analytics/sales-trend?range=weekly').then((res) => {
      if (Array.isArray(res.data) && res.data.length) setSalesTrend(res.data);
    }).catch(() => {});
    api.get('/analytics/most-ordered').then((res) => {
      if (Array.isArray(res.data) && res.data.length) setMostOrdered(res.data);
    }).catch(() => {});
    api.get('/tables/status').then((res) => {
      if (Array.isArray(res.data) && res.data.length) setTables(res.data);
    }).catch(() => {});
    api.get('/inventory/alerts').then((res) => {
      if (Array.isArray(res.data) && res.data.length) setAlerts(res.data);
    }).catch(() => {});
  }, []);

  const availableTables = tables.filter((t) => t.status === 'available').length;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-stone-100 mb-6">Dashboard</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Total sales" value={`₹${summary?.totalSales ?? '—'}`} />
        <StatCard label="Today's orders" value={summary?.todaysOrders ?? '—'} />
        <StatCard label="Available tables" value={`${availableTables}/${tables.length}`} />
        <StatCard label="Inventory alerts" value={alerts.length} />
        <StatCard label="Active customers" value="38" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border border-stone-800 bg-stone-900 p-5 shadow-lg shadow-black/20">
          <p className="text-brass text-xs tracking-widest uppercase font-mono mb-4">Weekly sales</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={salesTrend}>
              <CartesianGrid stroke="#292524" strokeDasharray="3 3" />
              <XAxis dataKey="_id" stroke="#78716c" fontSize={12} />
              <YAxis stroke="#78716c" fontSize={12} />
              <Tooltip contentStyle={{ background: '#1c1917', border: '1px solid #44403c' }} />
              <Line type="monotone" dataKey="total" stroke="#b5813f" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-stone-800 bg-stone-900 p-5 shadow-lg shadow-black/20">
          <p className="text-brass text-xs tracking-widest uppercase font-mono mb-4">Most ordered items</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={mostOrdered}>
              <CartesianGrid stroke="#292524" strokeDasharray="3 3" />
              <XAxis dataKey="_id" stroke="#78716c" fontSize={11} />
              <YAxis stroke="#78716c" fontSize={12} />
              <Tooltip contentStyle={{ background: '#1c1917', border: '1px solid #44403c' }} />
              <Bar dataKey="quantity" fill="#b5813f" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-5 shadow-lg shadow-black/20">
          <p className="text-rose-400 text-xs tracking-widest uppercase font-mono mb-3">Inventory alerts</p>
          <ul className="space-y-1 text-sm text-stone-300">
            {alerts.map((a) => (
              <li key={a._id}>
                {a.name}: {a.quantityAvailable}{a.unit} left (alert below {a.alertThreshold}{a.unit})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
