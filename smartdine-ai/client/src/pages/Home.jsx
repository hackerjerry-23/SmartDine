import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="max-w-2xl">
        <p className="text-brass text-xs tracking-widest uppercase font-mono mb-3">Table's ready when you are</p>
        <h1 className="text-4xl font-bold text-stone-100 mb-4">
          Order, reserve, and skip the wait — all from your phone.
        </h1>
        <p className="text-stone-400 mb-8">
          Check live dish availability, join the waitlist without standing in line,
          and let our table optimizer seat you at the best available spot the moment it's free.
        </p>
        <div className="flex gap-3">
          <Link to="/menu" className="rounded-md bg-brass hover:bg-brass-light text-stone-950 font-semibold px-5 py-2.5">
            View menu
          </Link>
          <Link to="/queue" className="rounded-md border border-stone-700 hover:border-stone-500 text-stone-200 font-semibold px-5 py-2.5">
            Join waitlist
          </Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mt-16">
        {[
          { title: 'Live availability', body: "See instantly which dishes are in the kitchen right now — no ordering something that's out of stock." },
          { title: 'Smart table matching', body: 'Our AI seats parties at the best-fit table the moment it frees up, instead of a first-come clipboard.' },
          { title: 'Real-time queue', body: 'Join the line from anywhere. Your position and wait time update live, with a notification when your table is ready.' },
        ].map((f) => (
          <div key={f.title} className="rounded-lg border border-stone-800 bg-stone-900 p-5">
            <p className="text-stone-100 font-semibold mb-2">{f.title}</p>
            <p className="text-stone-400 text-sm">{f.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
