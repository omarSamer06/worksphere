import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import LeaveForm from '../components/LeaveForm';
import LeaveCard from '../components/LeaveCard';
import api from '../services/api';

const RequestLeave = () => {
  const [submitted, setSubmitted] = useState([]);
  const [remainingLeave, setRemainingLeave] = useState(undefined);

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await api.get('/api/v1/users/me');
      setRemainingLeave(data.data.remainingLeave);
    } catch { /* non-critical */ }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleSuccess = (leave) => {
    setSubmitted((prev) => [leave, ...prev]);
    fetchProfile();
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <Link to="/leaves" className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Request Leave</h1>
          <p className="text-sm text-gray-500 mt-0.5">Submit a new leave request for approval</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <LeaveForm onSuccess={handleSuccess} remainingLeave={remainingLeave} />
          </div>
        </div>

        {/* Sidebar info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-indigo-900 mb-3">Leave Policy</h3>
            <ul className="space-y-2 text-xs text-indigo-700">
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5">•</span>
                Submit requests at least 2 days in advance when possible.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5">•</span>
                Sick leave can be submitted on the day itself.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5">•</span>
                All requests require manager or admin approval.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5">•</span>
                Approved leaves deduct from your annual balance.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Submitted this session */}
      {submitted.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">
            Submitted this session
            <span className="ml-2 bg-indigo-100 text-indigo-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {submitted.length}
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {submitted.map((leave) => (
              <LeaveCard key={leave._id} leave={leave} showActions={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestLeave;
