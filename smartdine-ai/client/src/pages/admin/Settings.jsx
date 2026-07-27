import { useEffect, useState } from 'react';
import api from '../../services/api';

const EMPTY = { emailHost: 'smtp.gmail.com', emailPort: 587, emailUser: '', emailPassword: '', emailSenderName: 'SmartDine AI' };

export default function AdminSettings() {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState(null); // { isConfigured, usingEnvFallback }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    api
      .get('/settings/email')
      .then((res) => {
        setStatus(res.data);
        setForm((f) => ({
          ...f,
          emailHost: res.data.emailHost,
          emailPort: res.data.emailPort,
          emailUser: res.data.emailUser,
          emailSenderName: res.data.emailSenderName,
        }));
      })
      .finally(() => setLoading(false));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      const { data } = await api.put('/settings/email', form);
      setStatus(data);
      setForm((f) => ({ ...f, emailPassword: '' }));
      setMessage({ type: 'success', text: 'Email settings saved and verified. Outgoing mail will now send from this address.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Could not save email settings' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-stone-100 mb-2">Settings</h1>
      <p className="text-stone-500 text-sm mb-6">
        Configure the email account SmartDine AI uses to send OTPs, reservation confirmations and queue
        notifications. Any admin can set this up here — no server file editing required.
      </p>

      {loading ? (
        <p className="text-stone-500 text-sm">Loading…</p>
      ) : (
        <>
          <div className="mb-6 rounded-lg border border-stone-800 bg-stone-900 p-4 text-sm">
            {status?.isConfigured ? (
              <p className="text-emerald-400">✓ Email is configured and sending from {form.emailUser}.</p>
            ) : status?.usingEnvFallback ? (
              <p className="text-amber-400">Using the server's default (.env) email credentials. Save your own below to take over.</p>
            ) : (
              <p className="text-rose-400">No email sender configured yet — OTPs and notifications won't be sent until you save one below.</p>
            )}
          </div>

          <form onSubmit={submit} className="rounded-lg border border-stone-800 bg-stone-900 p-5 space-y-4">
            <div>
              <label className="block text-stone-400 text-sm mb-1">Your email address</label>
              <input
                type="email"
                required
                placeholder="restaurant@gmail.com"
                value={form.emailUser}
                onChange={(e) => setForm({ ...form, emailUser: e.target.value })}
                className="w-full rounded-md bg-stone-800 border border-stone-700 px-3 py-2 text-stone-100 focus:outline-none focus:ring-2 focus:ring-brass"
              />
            </div>
            <div>
              <label className="block text-stone-400 text-sm mb-1">App password</label>
              <input
                type="password"
                required
                placeholder="16-character app password"
                value={form.emailPassword}
                onChange={(e) => setForm({ ...form, emailPassword: e.target.value })}
                className="w-full rounded-md bg-stone-800 border border-stone-700 px-3 py-2 text-stone-100 focus:outline-none focus:ring-2 focus:ring-brass"
              />
              <p className="text-stone-600 text-xs mt-1">
                For Gmail, generate this at myaccount.google.com → Security → App passwords. Your regular
                password won't work here. This is stored encrypted and never shown again.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-stone-400 text-sm mb-1">SMTP host</label>
                <input
                  value={form.emailHost}
                  onChange={(e) => setForm({ ...form, emailHost: e.target.value })}
                  className="w-full rounded-md bg-stone-800 border border-stone-700 px-3 py-2 text-stone-100 focus:outline-none focus:ring-2 focus:ring-brass"
                />
              </div>
              <div>
                <label className="block text-stone-400 text-sm mb-1">SMTP port</label>
                <input
                  type="number"
                  value={form.emailPort}
                  onChange={(e) => setForm({ ...form, emailPort: Number(e.target.value) })}
                  className="w-full rounded-md bg-stone-800 border border-stone-700 px-3 py-2 text-stone-100 focus:outline-none focus:ring-2 focus:ring-brass"
                />
              </div>
            </div>
            <div>
              <label className="block text-stone-400 text-sm mb-1">Sender name</label>
              <input
                value={form.emailSenderName}
                onChange={(e) => setForm({ ...form, emailSenderName: e.target.value })}
                className="w-full rounded-md bg-stone-800 border border-stone-700 px-3 py-2 text-stone-100 focus:outline-none focus:ring-2 focus:ring-brass"
              />
            </div>

            {message && (
              <p className={`text-sm ${message.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>{message.text}</p>
            )}

            <button
              disabled={saving}
              className="w-full rounded-md bg-brass hover:bg-brass-light disabled:opacity-50 text-stone-950 font-semibold py-2.5"
            >
              {saving ? 'Verifying & saving…' : 'Save email settings'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
