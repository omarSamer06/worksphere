import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';

const STATUS_FILTERS = ['all', 'applied', 'interviewing', 'accepted', 'rejected'];

const statusStyle = {
  applied:      { badge: 'bg-blue-50 text-blue-700 border-blue-200',    dot: 'bg-blue-500'   },
  interviewing: { badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-400'  },
  accepted:     { badge: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500'  },
  rejected:     { badge: 'bg-red-50 text-red-700 border-red-200',       dot: 'bg-red-500'    },
};

const STATUSES = ['applied', 'interviewing', 'accepted', 'rejected'];

const StatusBadge = ({ status }) => {
  const s = statusStyle[status] ?? { badge: 'bg-gray-50 text-gray-600 border-gray-200', dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${s.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
};

const Candidates = ({ onAddNew }) => {
  const [candidates, setCandidates] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Per-card state
  const [updatingId, setUpdatingId] = useState(null);
  const [hiringId, setHiringId] = useState(null);
  const [hireResult, setHireResult] = useState(null); // { name, tempPassword }
  const [actionError, setActionError] = useState({}); // { [id]: message }

  const fetchCandidates = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = filter !== 'all' ? { status: filter } : {};
    api
      .get('/candidates', { params })
      .then(({ data }) => setCandidates(data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load candidates.'))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { fetchCandidates(); }, [fetchCandidates]);

  const handleStatusChange = async (candidate, newStatus) => {
    setUpdatingId(candidate._id);
    setActionError((p) => ({ ...p, [candidate._id]: null }));
    try {
      const { data } = await api.put(`/candidates/${candidate._id}/status`, { status: newStatus });
      setCandidates((prev) => prev.map((c) => (c._id === candidate._id ? data.data : c)));
    } catch (err) {
      setActionError((p) => ({ ...p, [candidate._id]: err.response?.data?.message || 'Update failed.' }));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleHire = async (candidate) => {
    if (!window.confirm(`Hire ${candidate.name} and create an employee account?`)) return;
    setHiringId(candidate._id);
    setActionError((p) => ({ ...p, [candidate._id]: null }));
    try {
      const { data } = await api.post(`/candidates/${candidate._id}/hire`);
      setHireResult({ name: data.data.user.name, tempPassword: data.data.tempPassword });
      setCandidates((prev) => prev.map((c) =>
        c._id === candidate._id ? { ...c, hired: true } : c
      ));
    } catch (err) {
      setActionError((p) => ({ ...p, [candidate._id]: err.response?.data?.message || 'Hire failed.' }));
    } finally {
      setHiringId(null);
    }
  };

  const counts = {
    applied:      candidates.filter((c) => c.status === 'applied').length,
    interviewing: candidates.filter((c) => c.status === 'interviewing').length,
    accepted:     candidates.filter((c) => c.status === 'accepted').length,
    rejected:     candidates.filter((c) => c.status === 'rejected').length,
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-base font-semibold text-gray-900">Candidates</h2>
          {!loading && (
            <div className="flex gap-1.5 flex-wrap">
              {Object.entries(counts).map(([s, n]) =>
                n > 0 ? (
                  <span key={s} className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize border ${statusStyle[s]?.badge ?? ''}`}>
                    {n} {s}
                  </span>
                ) : null
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {STATUS_FILTERS.map((s) => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-colors ${
                  filter === s ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}>
                {s}
              </button>
            ))}
          </div>
          <button onClick={onAddNew}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">
            + Add
          </button>
        </div>
      </div>

      {/* Hire success banner */}
      {hireResult && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-xl px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-green-800 mb-1">
                ✓ {hireResult.name} has been hired successfully!
              </p>
              <p className="text-xs text-green-700">
                Temporary password:{' '}
                <span className="font-mono font-bold bg-green-100 px-2 py-0.5 rounded">
                  {hireResult.tempPassword}
                </span>
                <span className="ml-2 text-green-600">— share this with the new employee.</span>
              </p>
            </div>
            <button onClick={() => setHireResult(null)} className="text-green-400 hover:text-green-600 text-lg leading-none">×</button>
          </div>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4 flex justify-between">
          {error}
          <button onClick={fetchCandidates} className="text-xs underline">Retry</button>
        </div>
      )}

      {loading ? (
        <Loader />
      ) : candidates.length === 0 ? (
        <div className="text-sm text-gray-400 bg-gray-50 border border-gray-100 rounded-xl px-4 py-12 text-center">
          <svg className="w-8 h-8 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          No candidates found{filter !== 'all' ? ` with status "${filter}"` : ''}.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {candidates.map((c) => (
            <div key={c._id} className={`bg-white rounded-2xl border shadow-sm p-5 flex flex-col gap-3 ${c.hired ? 'border-green-200 bg-green-50/30' : 'border-gray-100'}`}>
              {/* Top row */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold uppercase shrink-0">
                      {c.name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{c.name}</p>
                      <p className="text-xs text-gray-400 truncate">{c.email}</p>
                    </div>
                  </div>
                </div>
                {c.hired
                  ? <span className="shrink-0 text-xs font-semibold text-green-600 bg-green-100 px-2.5 py-1 rounded-full border border-green-200">Hired</span>
                  : <StatusBadge status={c.status} />
                }
              </div>

              {/* Position */}
              {c.position && (
                <div className="text-xs text-gray-500">
                  <span className="text-gray-400">Position: </span>
                  <span className="font-medium text-gray-700">{c.position.title}</span>
                  {c.position.department?.name && (
                    <span className="text-gray-400"> · {c.position.department.name}</span>
                  )}
                </div>
              )}

              {/* Phone */}
              {c.phone && <p className="text-xs text-gray-400">{c.phone}</p>}

              {/* Action error */}
              {actionError[c._id] && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {actionError[c._id]}
                </p>
              )}

              {/* Actions */}
              {!c.hired && (
                <div className="flex gap-2 pt-1 border-t border-gray-100">
                  <select
                    value={c.status}
                    disabled={updatingId === c._id}
                    onChange={(e) => handleStatusChange(c, e.target.value)}
                    className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white disabled:opacity-50 capitalize"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s} className="capitalize">{s}</option>
                    ))}
                  </select>

                  {c.status === 'accepted' && (
                    <button
                      onClick={() => handleHire(c)}
                      disabled={hiringId === c._id}
                      className="px-3 py-2 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 disabled:bg-green-300 rounded-lg transition-colors whitespace-nowrap"
                    >
                      {hiringId === c._id ? 'Hiring…' : '✓ Hire'}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Candidates;
