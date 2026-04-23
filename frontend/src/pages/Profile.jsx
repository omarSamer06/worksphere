import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';

const inputCls = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder-gray-400';

const roleBadge = {
  admin:    'bg-red-100 text-red-700',
  manager:  'bg-amber-100 text-amber-700',
  employee: 'bg-emerald-100 text-emerald-700',
};

const Field = ({ label, value }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">{label}</p>
    <p className="text-sm font-medium text-gray-800">{value || <span className="text-gray-300 italic text-xs">Not set</span>}</p>
  </div>
);

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ phone: '', address: '', hireDate: '' });
  const [editing, setEditing] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users/me');
      setProfile(data.data);
      setForm({
        phone: data.data.phone || '',
        address: data.data.address || '',
        hireDate: data.data.hireDate ? data.data.hireDate.split('T')[0] : '',
      });
    } catch {
      setError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSuccess(false);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const { data } = await api.put('/users/me', form);
      setProfile(data.data);
      setSuccess(true);
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  const fmtDate = (d) => d
    ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  const leaveUsedPct = profile?.totalLeave > 0
    ? Math.min(Math.round((profile.usedLeave / profile.totalLeave) * 100), 100)
    : 0;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-0.5">View and update your account information</p>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Avatar section */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 px-6 py-8">
          <div className="flex items-end gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/20 text-white flex items-center justify-center text-2xl font-bold uppercase backdrop-blur-sm ring-2 ring-white/30">
              {profile?.name?.[0] ?? 'U'}
            </div>
            <div className="pb-1">
              <h2 className="text-xl font-bold text-white">{profile?.name}</h2>
              <p className="text-indigo-200 text-sm">{profile?.email}</p>
            </div>
            <div className="ml-auto pb-1">
              <span className={`capitalize text-xs font-semibold px-2.5 py-1 rounded-full ${roleBadge[profile?.role] ?? 'bg-gray-100 text-gray-600'}`}>
                {profile?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Fields */}
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5 mb-6">
            <Field label="Department" value={profile?.department?.name} />
            <Field label="Position"   value={profile?.position?.title} />
            <Field label="Manager"    value={profile?.manager?.name} />
            <Field label="Hire Date"  value={fmtDate(profile?.hireDate)} />
            <Field label="Phone"      value={profile?.phone} />
            <Field label="Address"    value={profile?.address} />
          </div>

          {/* Leave balance */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Leave Balance</p>
              <span className="text-xs text-gray-400">{leaveUsedPct}% used</span>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-3">
              {[
                { label: 'Total', value: profile?.totalLeave ?? 0, color: 'text-gray-800' },
                { label: 'Used', value: profile?.usedLeave ?? 0, color: 'text-amber-600' },
                { label: 'Remaining', value: profile?.remainingLeave ?? 0, color: 'text-emerald-600' },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${leaveUsedPct >= 90 ? 'bg-red-500' : leaveUsedPct >= 60 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                style={{ width: `${leaveUsedPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Edit section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold text-gray-900">Contact Details</h3>
          {!editing && (
            <button
              onClick={() => { setEditing(true); setSuccess(false); }}
              className="px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
            >
              Edit
            </button>
          )}
        </div>

        {success && (
          <div className="mb-4 flex items-center gap-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Profile updated successfully.
          </div>
        )}

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</div>
        )}

        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                placeholder="+1 (555) 000-0000" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
              <textarea name="address" rows={2} value={form.address} onChange={handleChange}
                placeholder="123 Main St, City, Country" className={`${inputCls} resize-none`} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Hire Date</label>
              <input type="date" name="hireDate" value={form.hireDate} onChange={handleChange} className={inputCls} />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={saving}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-xl transition-colors">
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <button type="button" onClick={() => setEditing(false)}
                className="px-6 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <Field label="Phone"   value={profile?.phone} />
            <Field label="Address" value={profile?.address} />
            <Field label="Hire Date" value={fmtDate(profile?.hireDate)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
