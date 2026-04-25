import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import LeaveCard from '../components/LeaveCard';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';

const STATUS_FILTERS = ['all', 'pending', 'approved', 'rejected'];

const filterDotColor = { pending: 'bg-amber-400', approved: 'bg-emerald-500', rejected: 'bg-red-500' };

const AllLeaves = () => {
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
      .get('/api/v1/leaves', { params })
      .then(({ data }) => setLeaves(data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load leave requests.'))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  const handleStatusChange = (updated) => {
    setLeaves((prev) => prev.map((l) => (l._id === updated._id ? updated : l)));
  };

  const counts = {
    pending:  leaves.filter((l) => l.status === 'pending').length,
    approved: leaves.filter((l) => l.status === 'approved').length,
    rejected: leaves.filter((l) => l.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">All Leave Requests</h1>
          <p className="text-sm text-gray-500 mt-0.5">Review and manage employee leave requests</p>
        </div>

        {/* Summary pills */}
        {!loading && (
          <div className="flex gap-2 flex-wrap">
            {Object.entries(counts).map(([status, count]) =>
              count > 0 ? (
                <span key={status} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold capitalize border
                  ${status === 'pending'  ? 'bg-amber-50 text-amber-700 border-amber-200'  : ''}
                  ${status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                  ${status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                `}>
                  <span className={`w-1.5 h-1.5 rounded-full ${filterDotColor[status]}`} />
                  {count} {status}
                </span>
              ) : null
            )}
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg capitalize transition-all ${
              filter === s
                ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 flex items-center justify-between">
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={fetchLeaves} className="text-xs font-semibold text-red-500 hover:text-red-700 underline">Retry</button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <Loader />
      ) : leaves.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-700 mb-1">No leave requests found</p>
          <p className="text-xs text-gray-400">
            {filter !== 'all' ? `No "${filter}" requests at the moment.` : 'Leave requests will appear here once submitted.'}
          </p>
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
