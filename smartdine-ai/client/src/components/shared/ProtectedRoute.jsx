import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-10 text-stone-400 text-sm">Loading…</div>;
  if (!user) return children;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
}
