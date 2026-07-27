import { useEffect, useState } from 'react';
import api from '../../services/api';
import { getSocket } from '../../services/socket';

const STATUS_STYLES = {
  available: { dot: 'bg-emerald-400', ring: 'ring-emerald-400/40', label: 'Available' },
  reserved: { dot: 'bg-amber-400', ring: 'ring-amber-400/40', label: 'Reserved' },
  occupied: { dot: 'bg-rose-400', ring: 'ring-rose-400/40', label: 'Occupied' },
  cleaning: { dot: 'bg-sky-400', ring: 'ring-sky-400/40', label: 'Cleaning' },
};

/**
 * Renders every table at its grid position (Table.positionX/Y), colored by
 * live status, with the AI's predicted "free in Xm" for occupied/cleaning
 * tables. Clicking a table opens quick actions (seat / clear).
 */
export default function LiveFloorMap() {
  const [tables, setTables] = useState([]);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    const { data } = await api.get('/tables/status');
    setTables(data);
  };

  useEffect(() => {
    load();
    const socket = getSocket();
    socket.emit('join', 'admin');
    socket.on('table:status-changed', load);
    socket.on('table:allocation-suggested', load);
    return () => {
      socket.off('table:status-changed', load);
      socket.off('table:allocation-suggested', load);
    };
  }, []);

  const cellSize = 110;
  const maxX = Math.max(0, ...tables.map((t) => t.table?.positionX || 0));
  const maxY = Math.max(0, ...tables.map((t) => t.table?.positionY || 0));

  return (
    <div className="rounded-lg border border-stone-700 bg-stone-900 p-6">
      <div className="flex items-center justify-between mb-5">
        <p className="text-[#c99a5c] text-xs tracking-widest uppercase font-mono">Live Floor Map</p>
        <div className="flex gap-4">
          {Object.entries(STATUS_STYLES).map(([key, s]) => (
            <div key={key} className="flex items-center gap-1.5 text-xs text-stone-400">
              <span className={`w-2 h-2 rounded-full ${s.dot}`} />
              {s.label}
            </div>
          ))}
        </div>
      </div>

      <div
        className="relative"
        style={{ width: (maxX + 1) * cellSize, height: (maxY + 1) * cellSize }}
      >
        {tables.map((t) => {
          const style = STATUS_STYLES[t.status] || STATUS_STYLES.available;
          return (
            <button
              key={t.id}
              onClick={() => setSelected(t)}
              className={`absolute flex flex-col items-center justify-center rounded-xl border border-stone-700 bg-stone-800 hover:bg-stone-750 ring-2 ${style.ring} transition-colors`}
              style={{
                width: cellSize - 16,
                height: cellSize - 16,
                left: (t.table?.positionX || 0) * cellSize,
                top: (t.table?.positionY || 0) * cellSize,
              }}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${style.dot} mb-1`} />
              <span className="text-stone-100 font-mono font-bold text-lg">T{t.table?.tableNumber}</span>
              <span className="text-stone-500 text-xs">{t.table?.capacity} seats</span>
              {t.status !== 'available' && (
                <span className="text-stone-400 text-[11px] font-mono mt-0.5">
                  ~{t.estimatedMinutesUntilFree}m
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selected && (
        <TableActionPanel table={selected} onClose={() => setSelected(null)} onChanged={load} />
      )}
    </div>
  );
}

function TableActionPanel({ table, onClose, onChanged }) {
  const [partySize, setPartySize] = useState(table.table?.capacity || 2);

  const seat = async () => {
    await api.patch(`/tables/${table.table._id}/seat`, { partySize });
    onChanged();
    onClose();
  };
  const clear = async () => {
    await api.patch(`/tables/${table.table._id}/clear`);
    onChanged();
    onClose();
  };

  return (
    <div className="mt-5 rounded-lg border border-stone-700 bg-stone-800 p-4 flex items-center gap-4">
      <span className="text-stone-100 font-mono font-semibold">
        Table {table.table?.tableNumber} — {STATUS_STYLES[table.status]?.label}
      </span>

      {table.status === 'available' && (
        <>
          <input
            type="number"
            min={1}
            max={table.table?.capacity}
            value={partySize}
            onChange={(e) => setPartySize(Number(e.target.value))}
            className="w-16 rounded bg-stone-900 border border-stone-700 px-2 py-1 text-stone-100"
          />
          <button onClick={seat} className="rounded bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-sm font-semibold px-3 py-1.5">
            Seat party
          </button>
        </>
      )}
      {table.status === 'occupied' && (
        <button onClick={clear} className="rounded bg-rose-500/80 hover:bg-rose-500 text-stone-950 text-sm font-semibold px-3 py-1.5">
          Mark as leaving
        </button>
      )}

      <button onClick={onClose} className="ml-auto text-stone-500 hover:text-stone-300 text-sm">
        Close
      </button>
    </div>
  );
}
