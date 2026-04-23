import { useEffect, useState } from 'react';
import api from '../services/api';

const Home = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get('/test')
      .then((res) => setStatus(res.data.message))
      .catch(() => setError('Failed to connect to API'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-10 text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-indigo-600 text-white rounded-full p-4">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">HR Management System</h1>
        <p className="text-gray-500 mb-8">Phase 1 — Foundation</p>

        <div className="bg-gray-50 rounded-xl p-4 mb-8">
          {loading && (
            <p className="text-gray-400 text-sm animate-pulse">Connecting to API...</p>
          )}
          {!loading && status && (
            <p className="text-green-600 font-medium text-sm">
              ✓ API Status: <span className="font-semibold">{status}</span>
            </p>
          )}
          {!loading && error && (
            <p className="text-red-500 text-sm">✗ {error}</p>
          )}
        </div>

        <div className="flex gap-3 justify-center">
          <a
            href="/login"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </a>
          <a
            href="#"
            className="inline-flex items-center px-6 py-3 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Learn More
          </a>
        </div>
      </div>
    </div>
  );
};

export default Home;
