import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { menuSeed } from '../data/menuSeed';

export default function Menu() {
  const [items, setItems] = useState(menuSeed);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [askError, setAskError] = useState('');
  const [asking, setAsking] = useState(false);
  const { addItem, items: cartItems, total } = useCart();

  const categories = useMemo(() => ['all', ...new Set(items.map((i) => i.category))], [items]);

  const filtered = items.filter((item) => {
    const matchesCategory = category === 'all' || item.category === category;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.category.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const askAssistant = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    setAsking(true);
    setAnswer('');
    setAskError('');

    const lowered = question.toLowerCase();
    if (lowered.includes('available') || lowered.includes('veg') || lowered.includes('spicy')) {
      const found = items.find((item) => item.name.toLowerCase().includes('biryani') || item.name.toLowerCase().includes('pizza'));
      setAnswer(`Suggested dish: ${found?.name || 'Paneer Tikka'} — it is currently available and highly rated.`);
    } else if (lowered.includes('recommend')) {
      setAnswer('Try Chicken Biryani or Butter Chicken for a rich and popular choice.');
    } else {
      setAnswer('Try searching by dish name like “Paneer Tikka” or category like “Biryani”.');
    }

    setAsking(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8 rounded-3xl border border-stone-800 bg-gradient-to-r from-stone-900 to-stone-950 p-6 shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-brass text-xs uppercase tracking-[0.35em] font-mono">Signature Menu</p>
            <h1 className="text-3xl font-semibold text-stone-100 mt-2">Premium dishes made fresh</h1>
            <p className="text-stone-400 mt-2">Search by name or category, check live availability, and order in a few taps.</p>
          </div>
          <div className="w-full md:w-72">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes or category…"
              className="w-full rounded-2xl border border-stone-700 bg-stone-900 px-4 py-3 text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-brass"
            />
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full px-3 py-1.5 text-sm capitalize ${category === c ? 'bg-brass text-stone-950' : 'border border-stone-700 bg-stone-900 text-stone-400'}`}
          >
            {c}
          </button>
        ))}
      </div>

      <form onSubmit={askAssistant} className="mb-8 rounded-2xl border border-stone-800 bg-stone-900 p-4">
        <p className="text-brass text-xs tracking-widest uppercase font-mono mb-2">AI food assistant</p>
        <div className="flex flex-col gap-2 md:flex-row">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Recommend something spicy or vegetarian"
            className="flex-1 rounded-xl border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-100"
          />
          <button disabled={asking} className="rounded-xl bg-brass px-4 py-2 text-sm font-semibold text-stone-950 disabled:opacity-50">
            {asking ? 'Thinking…' : 'Ask'}
          </button>
        </div>
        {answer && <p className="mt-3 text-sm text-stone-300">{answer}</p>}
        {askError && <p className="mt-3 text-sm text-rose-400">{askError}</p>}
      </form>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.7fr]">
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((item) => (
            <div key={item._id} className="overflow-hidden rounded-3xl border border-stone-800 bg-stone-900 shadow-xl shadow-black/20">
              <img src={item.image} alt={item.name} className="h-44 w-full object-cover" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-stone-100 font-semibold">{item.name}</p>
                    <p className="text-xs uppercase tracking-[0.25em] text-stone-500 mt-1">{item.category}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${item.isAvailable ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
                    {item.isAvailable ? 'Available' : 'Out of stock'}
                  </span>
                </div>

                <p className="mt-3 text-sm text-stone-400">{item.description}</p>

                <div className="mt-4 flex flex-wrap gap-2 text-xs text-stone-400">
                  <span className="rounded-full border border-stone-700 px-2.5 py-1">⭐ {item.rating}</span>
                  <span className="rounded-full border border-stone-700 px-2.5 py-1">⏱ {item.prepTime}</span>
                  <span className="rounded-full border border-stone-700 px-2.5 py-1">{item.isVeg ? '🥬 Veg' : '🍗 Non-Veg'}</span>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-stone-400">Starting at</p>
                    <p className="text-xl font-semibold text-stone-100">₹{item.price}</p>
                  </div>
                  <button
                    disabled={!item.isAvailable}
                    onClick={() => addItem(item)}
                    className="rounded-xl bg-brass px-4 py-2 text-sm font-semibold text-stone-950 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="rounded-3xl border border-stone-800 bg-stone-900 p-5 shadow-2xl shadow-black/20 h-fit">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-brass text-xs uppercase tracking-[0.35em] font-mono">Order summary</p>
              <h2 className="text-xl font-semibold text-stone-100 mt-1">Ready to pay</h2>
            </div>
            <Link to="/cart" className="text-sm text-brass">View cart</Link>
          </div>

          <div className="mt-5 space-y-3">
            {cartItems.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-stone-700 p-4 text-sm text-stone-400">Your basket is empty. Add a few dishes to begin your order.</p>
            ) : (
              cartItems.map((item) => (
                <div key={item.menuItem} className="flex items-center justify-between rounded-2xl border border-stone-800 bg-stone-950/70 px-3 py-3">
                  <div>
                    <p className="text-sm text-stone-100">{item.name}</p>
                    <p className="text-xs text-stone-500">Qty {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-stone-100">₹{item.price * item.quantity}</p>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 rounded-2xl border border-stone-800 bg-stone-950/70 p-4">
            <div className="flex items-center justify-between text-sm text-stone-400">
              <span>Subtotal</span>
              <span>₹{total}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-stone-400">
              <span>Service fee</span>
              <span>₹20</span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-stone-800 pt-3 text-base font-semibold text-stone-100">
              <span>Total</span>
              <span>₹{total + 20}</span>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200">
            <p className="font-semibold">Payment details</p>
            <p className="mt-1">Pay at the counter or via card on delivery. Your order summary will be sent to the admin dashboard instantly.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
