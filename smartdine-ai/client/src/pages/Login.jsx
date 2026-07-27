import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGoogleSignIn } from '../hooks/useGoogleSignIn';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  useGoogleSignIn();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold text-stone-100 mb-6">Log in</h1>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-stone-400 text-sm mb-1">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-md bg-stone-900 border border-stone-700 px-3 py-2 text-stone-100 focus:outline-none focus:ring-2 focus:ring-brass"
          />
        </div>
        <div>
          <label className="block text-stone-400 text-sm mb-1">Password</label>
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full rounded-md bg-stone-900 border border-stone-700 px-3 py-2 text-stone-100 focus:outline-none focus:ring-2 focus:ring-brass"
          />
        </div>

        {error && <p className="text-rose-400 text-sm">{error}</p>}

        <button
          disabled={loading}
          className="w-full rounded-md bg-brass hover:bg-brass-light disabled:opacity-50 text-stone-950 font-semibold py-2.5"
        >
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      {/* Google Identity Services renders its own button here once VITE_GOOGLE_CLIENT_ID is set */}
      <div id="google-signin-button" className="mt-4" />

      <p className="text-stone-500 text-sm mt-6">
        No account?{' '}
        <Link to="/register" className="text-brass-light hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
