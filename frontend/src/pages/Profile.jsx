import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';

const Field = ({ label, value }) => (
  <div>
    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</p>
    <p className="text-sm font-medium text-gray-800">{value || <span className="text-gray-300 italic">Not set</span>}</p>
  </div>
);

const inputCls = 'w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition';

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

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold text-gray-900">My Profile</h2>
        {!editing && (
          <button
            onClick={() => { setEditing(true); setSuccess(false); }}
            className="px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Read-only info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <div className="flex items-center gap-4 mb-6 pb-5 border-b border-gray-100">
          <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-bold uppercase shrink-0">
            {profile?.name?.[0] ?? 'U'}
          </div>
          <div>
            <p className="font-bold text-gray-900 text-lg">{profile?.name}</p>
            <p className="text-sm text-gray-500">{profile?.email}</p>
          </div>
          <span className={`ml-auto capitalize text-xs font-semibold px-2.5 py-1 rounded-full ${
            profile?.role === 'admin' ? 'bg-red-100 text-red-700' :
            profile?.role === 'manager' ? 'bg-amber-100 text-amber-700' :
            'bg-green-100 text-green-700'
          }`}>
            {profile?.role}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
          <Field label="Department" value={profile?.department?.name} />
          <Field label="Position" value={profile?.position?.title} />
          <Field label="Manager" value={profile?.manager?.name} />
          <Field label="Hire Date" value={fmtDate(profile?.hireDate)} />
          <Field label="Leave Balance" value={`${profile?.remainingLeave ?? 0} / ${profile?.totalLeave ?? 0} days`} />
        </div>
      </div>

      {/* Editable section */}
      {editing ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Update Contact Details</h3>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                name="address"
                rows={2}
                value={form.address}
                onChange={handleChange}
                placeholder="123 Main St, City, Country"
                className={`${inputCls} resize-none`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date</label>
              <input
                type="date"
                name="hireDate"
                value={form.hireDate}
                onChange={handleChange}
                className={inputCls}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-lg transition-colors"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Contact Details</h3>
          {success && (
            <div className="mb-4 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-4 py-3">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Profile updated successfully.
            </div>
          )}
          <div className="grid grid-cols-1 gap-4">
            <Field label="Phone" value={profile?.phone} />
            <Field label="Address" value={profile?.address} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
