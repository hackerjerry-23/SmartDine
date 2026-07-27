import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const { items, updateQuantity, total, clearCart, tableNumber } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (items.length === 0) return;
    api
      .post('/ai/recommend', { orderedItemNames: items.map((i) => i.name) })
      .then((res) => setRecommendations(res.data.suggestions || []))
      .catch(() => setRecommendations([]));
  }, [items.length]);

  const placeOrder = async () => {
    if (!user) return navigate('/login');
    setPlacing(true);
    try {
      await api.post('/orders', { items, tableId: tableNumber });
      clearCart();
      navigate('/orders');
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return <div className="max-w-2xl mx-auto px-6 py-16 text-stone-400">Your cart is empty.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-stone-100 mb-6">Your cart</h1>

      <div className="space-y-3 mb-6">
        {items.map((i) => (
          <div key={i.menuItem} className="flex items-center justify-between rounded-lg border border-stone-800 bg-stone-900 p-4">
            <div>
              <p className="text-stone-100 font-medium">{i.name}</p>
              <p className="text-stone-500 text-sm">₹{i.price} each</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => updateQuantity(i.menuItem, i.quantity - 1)} className="text-stone-400 hover:text-stone-100 w-6">−</button>
              <span className="text-stone-100 font-mono w-4 text-center">{i.quantity}</span>
              <button onClick={() => updateQuantity(i.menuItem, i.quantity + 1)} className="text-stone-400 hover:text-stone-100 w-6">+</button>
            </div>
          </div>
        ))}
      </div>

      {recommendations.length > 0 && (
        <div className="mb-6 rounded-lg border border-stone-800 bg-stone-900 p-4">
          <p className="text-brass text-xs tracking-widest uppercase font-mono mb-2">You might also like</p>
          <div className="flex flex-wrap gap-2">
            {recommendations.map((r) => (
              <span key={r.name} className="text-xs text-stone-300 border border-stone-700 rounded-full px-3 py-1">
                {r.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-stone-800 pt-4 mb-6">
        <span className="text-stone-400">Total</span>
        <span className="text-stone-100 font-mono text-xl font-bold">₹{total}</span>
      </div>

      <button
        onClick={placeOrder}
        disabled={placing}
        className="w-full rounded-md bg-brass hover:bg-brass-light disabled:opacity-50 text-stone-950 font-semibold py-3"
      >
        {placing ? 'Placing order…' : 'Place order'}
      </button>
    </div>
  );
}
