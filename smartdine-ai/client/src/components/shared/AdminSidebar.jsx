import { NavLink } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/menu', label: 'Menu' },
  { to: '/admin/reservations', label: 'Reservations' },
  { to: '/admin/tables', label: 'Tables & Queue' },
  { to: '/admin/qr-codes', label: 'Table QR Codes' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/inventory', label: 'Inventory' },
  { to: '/admin/staff', label: 'Staff' },
  { to: '/admin/customers', label: 'Customers' },
  { to: '/admin/analytics', label: 'Analytics' },
  { to: '/admin/settings', label: 'Settings' },
];

export default function AdminSidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-stone-800 bg-stone-950 min-h-screen p-4 flex flex-col">
      <div className="mb-6 px-2">
        <span className="font-mono font-bold text-stone-100">SmartDine</span>{' '}
        <span className="text-brass text-xs uppercase tracking-widest">Admin</span>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm ${
                isActive ? 'bg-brass/15 text-brass-light font-medium' : 'text-stone-400 hover:bg-stone-900 hover:text-stone-100'
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>

      <ThemeToggle />
    </aside>
  );
}
