import { useEffect, useState } from 'react';
import api from '../../services/api';
import { getSocket } from '../../services/socket';

const STEPS = ['received', 'cooking', 'ready', 'delivered'];

export default function OrdersAdmin() {
  const [orders, setOrders] = useState([
    {
      _id: 'demo-order-1',
      customer: { name: 'Nisha Rao' },
      status: 'received',
      totalAmount: 620,
      items: [{ name: 'Chicken Biryani', quantity: 2 }],
    },
    {
      _id: 'demo-order-2',
      customer: { name: 'Karan Mehta' },
      status: 'ready',
      totalAmount: 480,
      items: [{ name: 'Paneer Tikka', quantity: 1 }, { name: 'Mango Smoothie', quantity: 2 }],
    },
    {
      _id: 'demo-order-3',
      customer: { name: 'Sara Khan' },
      status: 'delivered',
      totalAmount: 760,
      items: [{ name: 'Butter Chicken', quantity: 1 }, { name: 'Gulab Jamun', quantity: 2 }],
    },
  ]);
  const [filter, setFilter] = useState('all');

  const load = () => api.get('/orders' + (filter !== 'all' ? `?status=${filter}` : '')).then((res) => {
    if (Array.isArray(res.data) && res.data.length) setOrders(res.data);
  }).catch(() => {});

  useEffect(() => {
    load();
    const socket = getSocket();
    socket.emit('join', 'admin');
    socket.on('order:new', load);
    return () => socket.off('order:new', load);
  }, [filter]);

  const advance = async (order) => {
    const idx = STEPS.indexOf(order.status);
    if (idx >= STEPS.length - 1) return;
    await api.patch(`/orders/${order._id}/status`, { status: STEPS[idx + 1] });
    load();
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-100">Orders</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-md bg-stone-900 border border-stone-700 px-3 py-1.5 text-sm text-stone-200"
        >
          <option value="all">All</option>
          {STEPS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        {orders.map((o) => (
          <div key={o._id} className="flex items-center justify-between rounded-md border border-stone-800 bg-stone-900 px-4 py-3">
            <div>
              <p className="text-stone-100 text-sm font-medium">{o.customer?.name || 'Guest'} · #{o._id.slice(-6)}</p>
              <p className="text-stone-500 text-xs">{o.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono uppercase text-stone-400">{o.status}</span>
              <span className="text-stone-100 font-mono text-sm">₹{o.totalAmount}</span>
              {o.status !== 'delivered' && (
                <button
                  onClick={() => advance(o)}
                  className="rounded bg-brass hover:bg-brass-light text-stone-950 text-xs font-semibold px-3 py-1.5"
                >
                  Advance →
                </button>
              )}
            </div>
          </div>
        ))}
        {orders.length === 0 && <p className="text-stone-500 text-sm">No orders.</p>}
      </div>
    </div>
  );
}
