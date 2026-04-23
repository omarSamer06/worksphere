import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import LeaveCard from '../components/LeaveCard';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';

const STATUS_FILTERS = ['all', 'pending', 'approved', 'rejected'];

const filterBadgeColor = {
  pending:  'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const AllLeaves = ({ onLeaveChange }) => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeaves = useCallback(() => {
    const params = filter !== 'all' ? { status: filter } : {};
    setLoading(true);
    setError(null);
    api
      .get('/leaves', { params })
      .then(({ data }) => setLeaves(data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load leaves.'))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  const handleStatusChange = (updated) => {
    setLeaves((prev) => prev.map((l) => (l._id === updated._id ? updated : l)));
    onLeaveChange?.();
  };

  const counts = {
    pending:  leaves.filter((l) => l.status === 'pending').length,
    approved: leaves.filter((l) => l.status === 'approved').length,
    rejected: leaves.filter((l) => l.status === 'rejected').length,
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-base font-semibold text-gray-900">All Leave Requests</h2>
          {!loading && (
            <div className="flex gap-1.5 flex-wrap">
              {Object.entries(counts).map(([status, count]) =>
                count > 0 ? (
                  <span key={status} className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${filterBadgeColor[status]}`}>
                    {count} {status}
                  </span>
                ) : null
              )}
            </div>
          )}
        </div>

        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-colors ${
                filter === s
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
          {error}
          <button onClick={fetchLeaves} className="text-xs text-red-500 hover:underline ml-4 shrink-0">
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <Loader />
      ) : leaves.length === 0 ? (
        <div className="text-sm text-gray-400 bg-gray-50 border border-gray-100 rounded-xl px-4 py-12 text-center">
          <svg className="w-8 h-8 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          No leave requests found{filter !== 'all' ? ` with status "${filter}"` : ''}.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {leaves.map((leave) => (
            <LeaveCard
              key={leave._id}
              leave={leave}
              currentUser={user}
              showActions
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AllLeaves;
