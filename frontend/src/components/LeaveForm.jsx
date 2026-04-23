import { useState } from 'react';
import api from '../services/api';

const today = () => new Date().toISOString().split('T')[0];

const LEAVE_TYPES = [
  { value: 'annual', label: 'Annual Leave' },
  { value: 'sick',   label: 'Sick Leave'   },
];

const LeaveForm = ({ onSuccess, remainingLeave }) => {
  const [form, setForm] = useState({ startDate: '', endDate: '', reason: '', type: 'annual' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const requestedDays =
    form.startDate && form.endDate && form.endDate >= form.startDate
      ? Math.ceil(
          (new Date(form.endDate) - new Date(form.startDate)) / (1000 * 60 * 60 * 24)
        ) + 1
      : 0;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.endDate < form.startDate) {
      setError('End date must be on or after the start date.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/leaves', form);
      setSuccess(true);
      setForm({ startDate: '', endDate: '', reason: '', type: 'annual' });
      onSuccess?.(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    'w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Leave request submitted successfully.
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {/* Leave balance preview */}
      {remainingLeave !== undefined && (
        <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-3 text-sm">
          <span className="text-indigo-700 font-medium">Remaining balance</span>
          <div className="flex items-center gap-3">
            <span className="font-bold text-indigo-800">{remainingLeave} days</span>
            {requestedDays > 0 && (
              <span className={`font-semibold text-xs px-2 py-0.5 rounded-full ${
                requestedDays > remainingLeave
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                −{requestedDays} requested
              </span>
            )}
          </div>
        </div>
      )}

      {/* Leave type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className={inputCls}
        >
          {LEAVE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            name="startDate"
            required
            min={today()}
            value={form.startDate}
            onChange={handleChange}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            name="endDate"
            required
            min={form.startDate || today()}
            value={form.endDate}
            onChange={handleChange}
            className={inputCls}
          />
        </div>
      </div>

      {requestedDays > 0 && (
        <p className="text-xs text-gray-500 -mt-1">
          Duration: <span className="font-semibold text-gray-700">{requestedDays} day{requestedDays !== 1 ? 's' : ''}</span>
        </p>
      )}

      {/* Reason */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
        <textarea
          name="reason"
          required
          rows={3}
          value={form.reason}
          onChange={handleChange}
          placeholder="Briefly describe the reason for your leave…"
          className={`${inputCls} resize-none`}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Submitting…
          </span>
        ) : (
          'Submit Request'
        )}
      </button>
    </form>
  );
};

export default LeaveForm;
