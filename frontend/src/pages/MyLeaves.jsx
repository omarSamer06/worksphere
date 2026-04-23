import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LeaveCard from '../components/LeaveCard';
import Loader from '../components/Loader';

const MyLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeaves = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .get('/leaves/my')
      .then(({ data }) => setLeaves(data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load leave requests.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  const pending  = leaves.filter((l) => l.status === 'pending').length;
  const approved = leaves.filter((l) => l.status === 'approved').length;
  const rejected = leaves.filter((l) => l.status === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Leaves</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track all your leave requests</p>
        </div>
        <Link
          to="/leaves/request"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Request
        </Link>
      </div>

      {/* Summary pills */}
      {!loading && leaves.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />{leaves.length} Total
          </span>
          {pending > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />{pending} Pending
            </span>
          )}
          {approved > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{approved} Approved
            </span>
          )}
          {rejected > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />{rejected} Rejected
            </span>
          )}
        </div>
      )}

      {/* Content */}
      {error ? (
        <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 flex items-center justify-between">
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={fetchLeaves} className="text-xs font-semibold text-red-500 hover:text-red-700 underline">Retry</button>
        </div>
      ) : loading ? (
        <Loader />
      ) : leaves.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-700 mb-1">No leave requests yet</p>
          <p className="text-xs text-gray-400 mb-5">When you submit a request, it will appear here.</p>
          <Link to="/leaves/request" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors">
            Submit your first request
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {leaves.map((leave) => (
            <LeaveCard key={leave._id} leave={leave} showActions={false} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyLeaves;
