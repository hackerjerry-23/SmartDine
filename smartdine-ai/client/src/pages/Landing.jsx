import { Link } from 'react-router-dom';

export default function Landing() {
  const portals = [
    {
      title: 'Customer Portal',
      description: 'Explore the menu, place orders, reserve tables, and track your dining experience in real time.',
      href: '/menu',
      accent: 'from-amber-500 to-orange-500',
      emoji: '🍽️',
    },
    {
      title: 'Admin Portal',
      description: 'Manage orders, reservations, inventory, and analytics from a modern control center.',
      href: '/admin',
      accent: 'from-slate-600 to-slate-800',
      emoji: '👨‍💼',
    },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,184,77,0.16),_transparent_35%)] px-6 py-16 text-stone-100">
      <div className="mx-auto max-w-6xl">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-brass text-xs uppercase tracking-[0.35em] font-mono mb-4">Smart Restaurant Experience</p>
          <h1 className="text-4xl md:text-6xl font-semibold mb-6 leading-tight">
            SmartDine AI – Intelligent Restaurant Management System
          </h1>
          <p className="text-stone-400 text-lg leading-8">
            A premium, AI-powered restaurant platform for seamless dining, real-time operations, smart reservations, and elegant admin control.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {portals.map((portal) => (
            <Link
              key={portal.title}
              to={portal.href}
              className="group rounded-3xl border border-stone-800 bg-stone-900/80 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl transition hover:-translate-y-1 hover:border-brass"
            >
              <div className={`inline-flex rounded-2xl bg-gradient-to-r ${portal.accent} px-4 py-3 text-4xl shadow-lg`}>
                {portal.emoji}
              </div>
              <h2 className="mt-6 text-2xl font-semibold text-stone-100">{portal.title}</h2>
              <p className="mt-3 text-sm leading-7 text-stone-400">{portal.description}</p>
              <div className="mt-6 inline-flex items-center text-sm font-semibold text-brass group-hover:translate-x-1 transition">
                Open portal →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
