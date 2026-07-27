import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../../services/api';

export default function Analytics() {
  const [peakHours, setPeakHours] = useState([
    { _id: 11, orders: 14 },
    { _id: 12, orders: 21 },
    { _id: 13, orders: 28 },
    { _id: 14, orders: 31 },
    { _id: 18, orders: 24 },
    { _id: 19, orders: 35 },
    { _id: 20, orders: 29 },
  ]);
  const [waitingTime, setWaitingTime] = useState([
    { date: 'Mon', avgWaitMin: 12, avgTableTurnoverMin: 48 },
    { date: 'Tue', avgWaitMin: 10, avgTableTurnoverMin: 45 },
    { date: 'Wed', avgWaitMin: 13, avgTableTurnoverMin: 50 },
    { date: 'Thu', avgWaitMin: 11, avgTableTurnoverMin: 47 },
    { date: 'Fri', avgWaitMin: 15, avgTableTurnoverMin: 54 },
    { date: 'Sat', avgWaitMin: 18, avgTableTurnoverMin: 58 },
  ]);

  useEffect(() => {
    api.get('/analytics/peak-hours').then((res) => {
      if (Array.isArray(res.data) && res.data.length) setPeakHours(res.data);
    }).catch(() => {});
    api.get('/analytics/waiting-time').then((res) => {
      if (Array.isArray(res.data) && res.data.length) setWaitingTime(res.data);
    }).catch(() => {});
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
      <h1 className="text-2xl font-bold text-stone-100">Analytics</h1>

      <div className="rounded-lg border border-stone-800 bg-stone-900 p-5">
        <p className="text-brass text-xs tracking-widest uppercase font-mono mb-4">Peak order hours</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={peakHours}>
            <CartesianGrid stroke="#292524" strokeDasharray="3 3" />
            <XAxis dataKey="_id" stroke="#78716c" fontSize={12} tickFormatter={(h) => `${h}:00`} />
            <YAxis stroke="#78716c" fontSize={12} />
            <Tooltip contentStyle={{ background: '#1c1917', border: '1px solid #44403c' }} />
            <Bar dataKey="orders" fill="#b5813f" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-lg border border-stone-800 bg-stone-900 p-5">
        <p className="text-brass text-xs tracking-widest uppercase font-mono mb-4">Waiting time & table turnover</p>
        {waitingTime.length === 0 ? (
          <p className="text-stone-500 text-sm">
            No rollup data yet — this populates once the daily analytics job has run (see README: WaitingTimeAnalytics).
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={waitingTime}>
              <CartesianGrid stroke="#292524" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#78716c" fontSize={12} />
              <YAxis stroke="#78716c" fontSize={12} />
              <Tooltip contentStyle={{ background: '#1c1917', border: '1px solid #44403c' }} />
              <Line type="monotone" dataKey="avgWaitMin" stroke="#b5813f" strokeWidth={2} dot={false} name="Avg wait (min)" />
              <Line type="monotone" dataKey="avgTableTurnoverMin" stroke="#38bdf8" strokeWidth={2} dot={false} name="Avg turnover (min)" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
