import { useEffect, useState } from 'react';
import api from '../../services/api';
import { getSocket } from '../../services/socket';

/**
 * Shows a customer their live position in the virtual queue.
 * Design note: styled like a kitchen order ticket - monospace numerals,
 * a torn-edge card, and a warm brass accent instead of a generic
 * progress-bar-and-card dashboard look.
 */
export default function QueueStatus({ queueId }) {
  const [state, setState] = useState(null); // { position, partiesAhead, estimatedWaitMin, status }
  const [notified, setNotified] = useState(null);

  useEffect(() => {
    if (!queueId) return;

    api.get(`/queue/status/${queueId}`).then((res) => setState(res.data));

    const socket = getSocket();
    socket.emit('join', `queue:${queueId}`);

    socket.on('queue:update', (payload) => {
      if (payload.queueId === queueId) setState((prev) => ({ ...prev, ...payload }));
    });
    socket.on('queue:notified', (payload) => {
      if (payload.queueId === queueId) setNotified(payload);
    });
    socket.on('queue:expired', (payload) => {
      if (payload.queueId === queueId) setState((prev) => ({ ...prev, status: 'expired' }));
    });

    return () => {
      socket.off('queue:update');
      socket.off('queue:notified');
      socket.off('queue:expired');
      socket.emit('leave', `queue:${queueId}`);
    };
  }, [queueId]);

  const leaveQueue = async () => {
    await api.patch(`/queue/leave/${queueId}`, { reason: 'cancelled' });
    setState((prev) => ({ ...prev, status: 'cancelled' }));
  };

  if (!state) {
    return <div className="text-sm text-stone-400 font-mono">Loading queue status…</div>;
  }

  if (notified) {
    return (
      <div className="max-w-sm rounded-lg border border-amber-500/40 bg-amber-500/10 p-5">
        <p className="text-amber-400 text-xs tracking-widest uppercase font-mono mb-1">Table Ready</p>
        <p className="text-stone-100 text-lg font-semibold">Your table is ready!</p>
        <p className="text-stone-400 text-sm mt-1">Please check in with the host within 5 minutes.</p>
      </div>
    );
  }

  if (state.status === 'cancelled' || state.status === 'expired' || state.status === 'seated') {
    const labels = { cancelled: 'You left the queue', expired: 'Your slot expired', seated: "You're seated — enjoy!" };
    return <div className="max-w-sm rounded-lg border border-stone-700 bg-stone-900 p-5 text-stone-300">{labels[state.status]}</div>;
  }

  return (
    <div className="max-w-sm rounded-lg border border-stone-700 bg-stone-900 p-5 relative overflow-hidden">
      {/* torn-ticket accent edge */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#b5813f]" />

      <p className="text-[#c99a5c] text-xs tracking-widest uppercase font-mono mb-3">SmartDine Queue</p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-stone-500 text-xs font-mono">Position</p>
          <p className="text-stone-50 text-4xl font-mono font-bold tabular-nums">{state.position ?? '—'}</p>
        </div>
        <div>
          <p className="text-stone-500 text-xs font-mono">Est. wait</p>
          <p className="text-stone-50 text-4xl font-mono font-bold tabular-nums">
            {state.estimatedWaitMin >= 999 ? '—' : `${state.estimatedWaitMin}m`}
          </p>
        </div>
      </div>

      <p className="text-stone-400 text-sm mb-4">
        {state.partiesAhead} {state.partiesAhead === 1 ? 'party' : 'parties'} ahead of you
      </p>

      <button
        onClick={leaveQueue}
        className="text-sm text-stone-400 hover:text-stone-200 underline underline-offset-2"
      >
        Leave queue
      </button>
    </div>
  );
}
