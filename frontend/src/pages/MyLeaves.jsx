import { useEffect, useState } from 'react';
import api from '../services/api';
import LeaveCard from '../components/LeaveCard';

const MyLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get('/leaves/my')
      .then(({ data }) => setLeaves(data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load leaves.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">My Leave Requests</h2>
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

const LoadingState = () => (
  <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
    <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
    Loading…
  </div>
);

const ErrorState = ({ message }) => (
  <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{message}</div>
);

const EmptyState = ({ message }) => (
  <div className="text-sm text-gray-400 bg-gray-50 border border-gray-100 rounded-xl px-4 py-8 text-center">{message}</div>
);

export default MyLeaves;
