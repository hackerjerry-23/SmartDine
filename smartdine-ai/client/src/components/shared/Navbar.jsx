import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const cartCount = items.reduce((n, i) => n + i.quantity, 0);

  return (
    <nav className="border-b border-stone-800 bg-stone-950/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-baseline gap-1.5">
          <span className="font-mono font-bold text-lg text-stone-100">SmartDine</span>
          <span className="text-brass text-xs tracking-widest uppercase">AI</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm text-stone-400">
          <Link to="/menu" className="hover:text-stone-100">Menu</Link>
          <Link to="/queue" className="hover:text-stone-100">Waitlist</Link>
          <Link to="/reservations" className="hover:text-stone-100">Reserve</Link>
          <Link to="/orders" className="hover:text-stone-100">Orders</Link>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link to="/cart" className="relative text-stone-300 hover:text-stone-100 text-sm">
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-brass text-stone-950 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          {user ? (
            <>
              {(user.role === 'admin' || user.role === 'staff') && (
                <Link to="/admin" className="text-sm text-stone-400 hover:text-stone-100">Dashboard</Link>
              )}
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="text-sm text-stone-400 hover:text-stone-100"
              >
                Log out
              </button>
            </>
          ) : (
            <Link to="/" className="rounded-md bg-brass hover:bg-brass-light text-stone-950 text-sm font-semibold px-3 py-1.5">
              Choose Portal
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
