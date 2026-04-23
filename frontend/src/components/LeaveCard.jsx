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

const typeStyles = {
  annual: 'bg-blue-50 text-blue-600 border-blue-100',
  sick:   'bg-purple-50 text-purple-600 border-purple-100',
};

const fmt = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const LeaveCard = ({ leave, currentUser, showActions = false, onStatusChange }) => {
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  // Determine if current user can approve/reject this specific leave
  const canAct = (() => {
    if (!showActions || leave.status !== 'pending' || !currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'manager') {
      const managerId =
        typeof leave.user?.manager === 'object'
          ? leave.user?.manager?._id
          : leave.user?.manager;
      return managerId && managerId.toString() === currentUser.id;
    }
    return false;
  })();

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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
      {/* Header row */}
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

      {/* Type + dates row */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
        {leave.type && (
          <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-semibold capitalize ${
            typeStyles[leave.type] ?? 'bg-gray-50 text-gray-500 border-gray-100'
          }`}>
            {leave.type}
          </span>
        )}
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {fmt(leave.startDate)}
        </span>
        <span className="text-gray-300">→</span>
        <span>{fmt(leave.endDate)}</span>
        {leave.days && (
          <span className="text-gray-400 font-medium">{leave.days}d</span>
        )}
      </div>

      {/* Manager assignment notice for managers */}
      {showActions && currentUser?.role === 'manager' && !canAct && leave.status === 'pending' && (
        <p className="text-xs text-gray-400 italic">Not assigned as this employee's manager</p>
      )}

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {canAct && (
        <div className="flex gap-2 pt-1 border-t border-gray-100">
          <button
            onClick={() => handleAction('approved')}
            disabled={!!loading}
            className="flex-1 py-2 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 disabled:bg-green-300 rounded-lg transition-colors"
          >
            {loading === 'approved' ? 'Approving…' : '✓ Approve'}
          </button>
          <button
            onClick={() => handleAction('rejected')}
            disabled={!!loading}
            className="flex-1 py-2 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 disabled:bg-red-300 rounded-lg transition-colors"
          >
            {loading === 'rejected' ? 'Rejecting…' : '✕ Reject'}
          </button>
        </div>
      )}
    </div>
  );
};

export default LeaveCard;
