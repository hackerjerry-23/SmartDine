import { useEffect, useState } from 'react';
import api from '../services/api';
import { getSocket } from '../services/socket';
import { useAuth } from '../context/AuthContext';

const STEPS = ['received', 'cooking', 'ready', 'delivered'];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/orders/mine').then((res) => setOrders(res.data));

    const socket = getSocket();
    if (user) socket.emit('join', `customer:${user.id}`);
    socket.on('order:status-changed', ({ orderId, status }) => {
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status } : o)));
    });
    return () => socket.off('order:status-changed');
  }, [user]);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-stone-100 mb-6">Your orders</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const stepIndex = STEPS.indexOf(order.status);
          return (
            <div key={order._id} className="rounded-lg border border-stone-800 bg-stone-900 p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-stone-500 text-xs font-mono">#{order._id.slice(-6)}</span>
                <span className="text-stone-100 font-mono">₹{order.totalAmount}</span>
              </div>

              <div className="flex items-center">
                {STEPS.map((step, i) => (
                  <div key={step} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center">
                      <span
                        className={`w-3 h-3 rounded-full ${i <= stepIndex ? 'bg-brass' : 'bg-stone-700'}`}
                      />
                      <span className={`text-[11px] mt-1.5 capitalize ${i <= stepIndex ? 'text-stone-200' : 'text-stone-600'}`}>
                        {step}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`h-px flex-1 mx-1 ${i < stepIndex ? 'bg-brass' : 'bg-stone-700'}`} />
                    )}
                  </div>
                ))}
              </div>

              <ul className="mt-4 text-sm text-stone-400 space-y-1">
                {order.items.map((it, idx) => (
                  <li key={idx}>{it.quantity}× {it.name}</li>
                ))}
              </ul>
            </div>
          );
        })}
        {orders.length === 0 && <p className="text-stone-500 text-sm">You haven't placed any orders yet.</p>}
      </div>
    </div>
  );
}
