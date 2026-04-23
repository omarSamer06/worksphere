import { useEffect, useState } from 'react';
import api from '../services/api';
import LeaveCard from '../components/LeaveCard';

const STATUS_FILTERS = ['all', 'pending', 'approved', 'rejected'];

const AllLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = filter !== 'all' ? { status: filter } : {};
    setLoading(true);
    api
      .get('/leaves', { params })
      .then(({ data }) => setLeaves(data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load leaves.'))
      .finally(() => setLoading(false));
  }, [filter]);

  const handleStatusChange = (updated) => {
    setLeaves((prev) =>
      prev.map((l) => (l._id === updated._id ? updated : l))
    );
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <h2 className="text-lg font-semibold text-gray-900">All Leave Requests</h2>
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
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
          <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Loading…
        </div>
      ) : leaves.length === 0 ? (
        <div className="text-sm text-gray-400 bg-gray-50 border border-gray-100 rounded-xl px-4 py-8 text-center">
          No leave requests found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {leaves.map((leave) => (
            <LeaveCard
              key={leave._id}
              leave={leave}
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
