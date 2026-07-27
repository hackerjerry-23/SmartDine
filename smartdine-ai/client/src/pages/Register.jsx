import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [userId, setUserId] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submitForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await register(form);
      setUserId(data.userId);
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const submitOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await verifyOtp(userId, otp);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'otp') {
    return (
      <div className="max-w-sm mx-auto px-6 py-16">
        <h1 className="text-2xl font-bold text-stone-100 mb-2">Verify your email</h1>
        <p className="text-stone-400 text-sm mb-6">We sent a 6-digit code to {form.email}.</p>
        <form onSubmit={submitOtp} className="space-y-4">
          <input
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            className="w-full rounded-md bg-stone-900 border border-stone-700 px-3 py-2 text-stone-100 tracking-[0.5em] text-center font-mono text-lg focus:outline-none focus:ring-2 focus:ring-brass"
          />
          {error && <p className="text-rose-400 text-sm">{error}</p>}
          <button
            disabled={loading}
            className="w-full rounded-md bg-brass hover:bg-brass-light disabled:opacity-50 text-stone-950 font-semibold py-2.5"
          >
            {loading ? 'Verifying…' : 'Verify'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold text-stone-100 mb-6">Create account</h1>
      <form onSubmit={submitForm} className="space-y-4">
        {['name', 'email', 'phone'].map((field) => (
          <div key={field}>
            <label className="block text-stone-400 text-sm mb-1 capitalize">{field}</label>
            <input
              required={field !== 'phone'}
              type={field === 'email' ? 'email' : 'text'}
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              className="w-full rounded-md bg-stone-900 border border-stone-700 px-3 py-2 text-stone-100 focus:outline-none focus:ring-2 focus:ring-brass"
            />
          </div>
        ))}
        <div>
          <label className="block text-stone-400 text-sm mb-1">Password</label>
          <input
            required
            type="password"
            minLength={6}
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
          {loading ? 'Creating…' : 'Create account'}
        </button>
      </form>
    </div>
  );
}
