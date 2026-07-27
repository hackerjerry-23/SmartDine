import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../services/api';

export default function TableQRCodes() {
  const [tables, setTables] = useState([
    { _id: 'table-1', table: { tableNumber: 1 }, status: 'available' },
    { _id: 'table-2', table: { tableNumber: 2 }, status: 'available' },
    { _id: 'table-3', table: { tableNumber: 3 }, status: 'reserved' },
    { _id: 'table-4', table: { tableNumber: 4 }, status: 'occupied' },
    { _id: 'table-5', table: { tableNumber: 5 }, status: 'available' },
    { _id: 'table-6', table: { tableNumber: 6 }, status: 'available' },
  ]);
  const baseUrl = import.meta.env.VITE_CLIENT_URL || window.location.origin;

  useEffect(() => {
    api.get('/tables/status').then((res) => {
      if (Array.isArray(res.data) && res.data.length) setTables(res.data);
    }).catch(() => {});
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-stone-100 mb-2">Table QR codes</h1>
      <p className="text-stone-400 text-sm mb-6">
        Print these and place one on each table. Scanning routes the customer straight to the menu with their table pre-attached.
      </p>

      <div className="grid sm:grid-cols-3 md:grid-cols-4 gap-4">
        {tables.map((t) => {
          const url = `${baseUrl}/qr-checkin?table=${t.table?.tableNumber}`;
          return (
            <div key={t.id} className="rounded-lg border border-stone-800 bg-white p-4 flex flex-col items-center">
              <QRCodeSVG value={url} size={140} />
              <p className="text-stone-900 font-mono font-bold mt-3">Table {t.table?.tableNumber}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
