import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import LeaveCard from '../components/LeaveCard';
import Loader from '../components/Loader';

const MyLeaves = ({ onLeaveChange }) => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeaves = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .get('/leaves/my')
      .then(({ data }) => setLeaves(data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load leaves.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  if (loading) return <Loader />;

  if (error) return (
    <div className="flex flex-col items-center gap-3 py-10">
      <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 w-full">{error}</p>
      <button onClick={fetchLeaves} className="text-sm text-indigo-600 hover:underline">Try again</button>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">My Leave Requests</h2>
        <span className="text-xs text-gray-400">{leaves.length} total</span>
      </div>

      {leaves.length === 0 ? (
        <EmptyState message="You have no leave requests yet." />
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

const EmptyState = ({ message }) => (
  <div className="text-sm text-gray-400 bg-gray-50 border border-gray-100 rounded-xl px-4 py-12 text-center">
    <svg className="w-8 h-8 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
    {message}
  </div>
);

export default MyLeaves;
