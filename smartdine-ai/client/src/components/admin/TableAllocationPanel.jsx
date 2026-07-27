import { useState } from 'react';
import api from '../../services/api';

/**
 * Staff-facing tool: enter a walk-in party size, get the AI's ranked
 * recommendation with its reasoning exposed, confirm it or pick an
 * alternative/override manually.
 */
export default function TableAllocationPanel() {
  const [partySize, setPartySize] = useState(2);
  const [zone, setZone] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runOptimizer = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/tables/allocate', {
        partySize,
        zonePreference: zone || undefined,
      });
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  const confirm = async () => {
    await api.post(`/tables/allocate/${result.allocationId}/confirm`);
    setResult(null);
  };

  const override = async (tableId) => {
    await api.patch(`/tables/allocate/${result.allocationId}/override`, {
      finalTableId: tableId,
      reason: 'Staff manual override',
    });
    setResult(null);
  };

  return (
    <div className="rounded-lg border border-stone-700 bg-stone-900 p-6">
      <p className="text-[#c99a5c] text-xs tracking-widest uppercase font-mono mb-4">
        AI Table Allocation
      </p>

      <div className="flex items-end gap-3 mb-5">
        <div>
          <label className="block text-stone-400 text-xs mb-1">Party size</label>
          <input
            type="number"
            min={1}
            value={partySize}
            onChange={(e) => setPartySize(Number(e.target.value))}
            className="w-20 rounded bg-stone-800 border border-stone-700 px-2 py-1.5 text-stone-100"
          />
        </div>
        <div>
          <label className="block text-stone-400 text-xs mb-1">Zone (optional)</label>
          <select
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            className="rounded bg-stone-800 border border-stone-700 px-2 py-1.5 text-stone-100"
          >
            <option value="">Any</option>
            <option value="indoor">Indoor</option>
            <option value="outdoor">Outdoor</option>
            <option value="window">Window</option>
            <option value="private">Private</option>
            <option value="bar">Bar</option>
          </select>
        </div>
        <button
          onClick={runOptimizer}
          disabled={loading}
          className="rounded-md bg-[#b5813f] hover:bg-[#c99a5c] disabled:opacity-50 text-stone-950 font-semibold px-4 py-1.5"
        >
          {loading ? 'Finding table…' : 'Find best table'}
        </button>
      </div>

      {result && (
        <div className="space-y-3">
          <div className="rounded-md border border-emerald-500/40 bg-emerald-500/5 p-4">
            <div className="flex items-center justify-between">
              <span className="text-stone-100 font-mono font-bold text-lg">
                Table {result.recommended.table.tableNumber}
              </span>
              <span className="text-emerald-400 text-xs font-mono">score {result.recommended.score}/100</span>
            </div>
            <p className="text-stone-400 text-sm mt-1">{result.recommended.reason}</p>
            <button
              onClick={confirm}
              className="mt-3 rounded bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-sm font-semibold px-3 py-1.5"
            >
              Confirm this table
            </button>
          </div>

          {result.alternatives?.length > 0 && (
            <div>
              <p className="text-stone-500 text-xs font-mono mb-2">Alternatives</p>
              <div className="flex gap-2">
                {result.alternatives.map((alt) => (
                  <button
                    key={alt.table._id}
                    onClick={() => override(alt.table._id)}
                    className="rounded border border-stone-700 hover:border-stone-500 px-3 py-2 text-sm text-stone-300"
                  >
                    T{alt.table.tableNumber} · score {alt.score} ·{' '}
                    {alt.estimatedAvailableInMin <= 0 ? 'now' : `~${alt.estimatedAvailableInMin}m`}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
