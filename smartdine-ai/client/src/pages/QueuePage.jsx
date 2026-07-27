import { useState } from 'react';
import JoinQueueForm from '../components/customer/JoinQueueForm';
import QueueStatus from '../components/customer/QueueStatus';

export default function QueuePage() {
  const [queueId, setQueueId] = useState(() => sessionStorage.getItem('sd_queue_id'));

  const handleJoined = (id) => {
    sessionStorage.setItem('sd_queue_id', id);
    setQueueId(id);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-stone-100 mb-6">Waitlist</h1>
      {queueId ? <QueueStatus queueId={queueId} /> : <JoinQueueForm onJoined={handleJoined} />}
    </div>
  );
}
