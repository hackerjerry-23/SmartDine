import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="max-w-md mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-stone-100 mb-6">Profile</h1>
      <div className="rounded-lg border border-stone-800 bg-stone-900 p-5 space-y-3">
        <div>
          <p className="text-stone-500 text-xs">Name</p>
          <p className="text-stone-100">{user.name}</p>
        </div>
        <div>
          <p className="text-stone-500 text-xs">Email</p>
          <p className="text-stone-100">{user.email}</p>
        </div>
        <div>
          <p className="text-stone-500 text-xs">Role</p>
          <p className="text-stone-100 capitalize">{user.role}</p>
        </div>
      </div>
    </div>
  );
}
