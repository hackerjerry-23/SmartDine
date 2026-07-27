import { useEffect, useState } from 'react';
import api from '../../services/api';
import { getSocket } from '../../services/socket';

export default function QueueDashboard() {
  const [queue, setQueue] = useState([]);

  const load = async () => {
    const { data } = await api.get('/queue/status');
    setQueue(data);
  };

  useEffect(() => {
    load();
    const socket = getSocket();
    socket.emit('join', 'admin');
    socket.on('queue:dashboard-update', load);
    return () => socket.off('queue:dashboard-update', load);
  }, []);

  const notify = async (id) => {
    await api.post(`/queue/notify/${id}`, {});
    load();
  };

  return (
    <div className="rounded-lg border border-stone-700 bg-stone-900 p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[#c99a5c] text-xs tracking-widest uppercase font-mono">Queue Dashboard</p>
        <span className="text-stone-500 text-sm">{queue.length} waiting</span>
      </div>

      <div className="space-y-2">
        {queue.length === 0 && <p className="text-stone-500 text-sm">No one is currently waiting.</p>}
        {queue.map((entry) => (
          <div
            key={entry._id}
            className="flex items-center justify-between rounded-md border border-stone-800 bg-stone-800/50 px-4 py-3"
          >
            <div className="flex items-center gap-4">
              <span className="font-mono text-stone-100 font-bold w-6 text-center">{entry.position}</span>
              <div>
                <p className="text-stone-100 text-sm font-medium">{entry.guestName}</p>
                <p className="text-stone-500 text-xs">Party of {entry.partySize} · {entry.status}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-stone-400 text-sm font-mono">
                {entry.estimatedWaitMin >= 999 ? '—' : `${entry.estimatedWaitMin}m`}
              </span>
              {entry.status === 'waiting' && (
                <button
                  onClick={() => notify(entry._id)}
                  className="rounded bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-semibold px-3 py-1.5"
                >
                  Notify: table ready
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
