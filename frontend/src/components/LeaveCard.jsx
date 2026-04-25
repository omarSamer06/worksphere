import { useState } from 'react';
import api from '../services/api';

const statusStyles = {
  pending:  { badge: 'bg-amber-50 text-amber-700 border-amber-200',    dot: 'bg-amber-400'   },
  approved: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  rejected: { badge: 'bg-red-50 text-red-700 border-red-200',           dot: 'bg-red-500'     },
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
      const { data } = await api.put(`/api/v1/leaves/${leave._id}`, { status });
      onStatusChange?.(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const s = statusStyles[leave.status] ?? { badge: 'bg-gray-50 text-gray-600 border-gray-200', dot: 'bg-gray-400' };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {leave.user && (
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold uppercase shrink-0">
                {leave.user.name?.[0] ?? '?'}
              </div>
              <p className="text-xs font-medium text-gray-500 truncate">
                {leave.user.name} · <span className="capitalize text-gray-400">{leave.user.role}</span>
              </p>
            </div>
          )}
          <p className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2">{leave.reason}</p>
        </div>
        <span className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${s.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
          {leave.status}
        </span>
      </div>

      {/* Dates + type */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {leave.type && (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-lg border text-xs font-semibold capitalize ${typeStyles[leave.type] ?? 'bg-gray-50 text-gray-500 border-gray-100'}`}>
            {leave.type}
          </span>
        )}
        <div className="flex items-center gap-1.5 text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {fmt(leave.startDate)}
          <span className="text-gray-300 mx-0.5">→</span>
          {fmt(leave.endDate)}
          {leave.days && <span className="ml-1 font-semibold text-gray-600">{leave.days}d</span>}
        </div>
      </div>

      {/* Manager notice */}
      {showActions && currentUser?.role === 'manager' && !canAct && leave.status === 'pending' && (
        <p className="text-xs text-gray-400 italic">Not assigned as this employee's manager</p>
      )}

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>
      )}

      {canAct && (
        <div className="flex gap-2 pt-1 border-t border-gray-100">
          <button
            onClick={() => handleAction('approved')}
            disabled={!!loading}
            className="flex-1 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 rounded-xl transition-colors"
          >
            {loading === 'approved' ? 'Approving…' : '✓ Approve'}
          </button>
          <button
            onClick={() => handleAction('rejected')}
            disabled={!!loading}
            className="flex-1 py-2.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 disabled:bg-red-300 rounded-xl transition-colors"
          >
            {loading === 'rejected' ? 'Rejecting…' : '✕ Reject'}
          </button>
        </div>
      )}
    </div>
  );
};

export default LeaveCard;
