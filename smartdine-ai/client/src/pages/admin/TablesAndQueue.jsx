import LiveFloorMap from '../../components/admin/LiveFloorMap';
import TableAllocationPanel from '../../components/admin/TableAllocationPanel';
import QueueDashboard from '../../components/admin/QueueDashboard';

export default function TablesAndQueue() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
      <h1 className="text-2xl font-bold text-stone-100">Tables & Queue</h1>
      <TableAllocationPanel />
      <LiveFloorMap />
      <QueueDashboard />
    </div>
  );
}
