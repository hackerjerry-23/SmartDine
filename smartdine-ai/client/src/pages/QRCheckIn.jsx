import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

/**
 * Each table's QR code points to /qr-checkin?table=<tableNumber>.
 * Scanning it attaches the table number to the customer's cart so their
 * order is routed to the right table, then sends them straight to the menu.
 */
export default function QRCheckIn() {
  const [params] = useSearchParams();
  const { setTableNumber } = useCart();
  const navigate = useNavigate();
  const [table] = useState(params.get('table'));

  useEffect(() => {
    if (table) {
      setTableNumber(table);
      const t = setTimeout(() => navigate('/menu'), 1200);
      return () => clearTimeout(t);
    }
  }, [table]);

  return (
    <div className="max-w-sm mx-auto px-6 py-20 text-center">
      {table ? (
        <>
          <p className="text-brass text-xs tracking-widest uppercase font-mono mb-2">Checked in</p>
          <p className="text-stone-100 text-2xl font-bold mb-2">Table {table}</p>
          <p className="text-stone-400 text-sm">Taking you to the menu…</p>
        </>
      ) : (
        <p className="text-stone-400 text-sm">No table code found in this link. Please rescan the QR code at your table.</p>
      )}
    </div>
  );
}
