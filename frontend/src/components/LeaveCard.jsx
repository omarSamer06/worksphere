import { useState } from 'react';
import api from '../services/api';

const statusStyles = {
  pending:  'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
};

const statusDot = {
  pending:  'bg-amber-400',
  approved: 'bg-green-500',
  rejected: 'bg-red-500',
};

const fmt = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const LeaveCard = ({ leave, showActions = false, onStatusChange }) => {
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const handleAction = async (status) => {
    setLoading(status);
    setError(null);
    try {
      const { data } = await api.put(`/leaves/${leave._id}`, { status });
      onStatusChange?.(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {leave.user && (
            <p className="text-xs font-medium text-gray-400 mb-1 truncate">
              {leave.user.name} &middot; <span className="capitalize">{leave.user.role}</span>
            </p>
          )}
          <p className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2">
            {leave.reason}
          </p>
        </div>
        <span
          className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${
            statusStyles[leave.status] ?? 'bg-gray-50 text-gray-600 border-gray-200'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${statusDot[leave.status] ?? 'bg-gray-400'}`} />
          {leave.status}
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {fmt(leave.startDate)}
        </span>
        <span className="text-gray-300">→</span>
        <span>{fmt(leave.endDate)}</span>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {showActions && leave.status === 'pending' && (
        <div className="flex gap-2 pt-1 border-t border-gray-100">
          <button
            onClick={() => handleAction('approved')}
            disabled={!!loading}
            className="flex-1 py-2 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 disabled:bg-green-300 rounded-lg transition-colors"
          >
            {loading === 'approved' ? 'Approving…' : 'Approve'}
          </button>
          <button
            onClick={() => handleAction('rejected')}
            disabled={!!loading}
            className="flex-1 py-2 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 disabled:bg-red-300 rounded-lg transition-colors"
          >
            {loading === 'rejected' ? 'Rejecting…' : 'Reject'}
          </button>
        </div>
      )}
    </div>
  );
};

export default LeaveCard;
