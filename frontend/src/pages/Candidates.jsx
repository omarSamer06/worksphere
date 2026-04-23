import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';

const STATUS_FILTERS = ['all', 'applied', 'interviewing', 'accepted', 'rejected'];
const STATUSES = ['applied', 'interviewing', 'accepted', 'rejected'];

const statusStyle = {
  applied:      { badge: 'bg-blue-50 text-blue-700 border-blue-200',     dot: 'bg-blue-500'    },
  interviewing: { badge: 'bg-amber-50 text-amber-700 border-amber-200',  dot: 'bg-amber-400'   },
  accepted:     { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  rejected:     { badge: 'bg-red-50 text-red-700 border-red-200',        dot: 'bg-red-500'     },
};

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

  const [updatingId, setUpdatingId] = useState(null);
  const [hiringId, setHiringId] = useState(null);
  const [hireResult, setHireResult] = useState(null);
  const [actionError, setActionError] = useState({});

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
      setCandidates((prev) => prev.map((c) => c._id === candidate._id ? { ...c, hired: true } : c));
    } catch (err) {
      setActionError((p) => ({ ...p, [candidate._id]: err.response?.data?.message || 'Hire failed.' }));
    } finally {
      setHiringId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Recruitment</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage candidates and hiring pipeline</p>
        </div>
        <button
          onClick={onAddNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Candidate
        </button>
      </div>

      {/* Hire success banner */}
      {hireResult && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-emerald-800 mb-1">✓ {hireResult.name} has been hired!</p>
              <p className="text-xs text-emerald-700">
                Temporary password:{' '}
                <span className="font-mono font-bold bg-emerald-100 px-2 py-0.5 rounded">{hireResult.tempPassword}</span>
                <span className="ml-2 text-emerald-600">— share this with the new employee.</span>
              </p>
            </div>
            <button onClick={() => setHireResult(null)} className="text-emerald-400 hover:text-emerald-600 text-xl leading-none shrink-0">×</button>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit flex-wrap">
        {STATUS_FILTERS.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-2 text-xs font-semibold rounded-lg capitalize transition-all ${
              filter === s ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {s}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 flex items-center justify-between">
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={fetchCandidates} className="text-xs font-semibold text-red-500 hover:text-red-700 underline">Retry</button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <Loader />
      ) : candidates.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-700 mb-1">No candidates found</p>
          <p className="text-xs text-gray-400 mb-5">
            {filter !== 'all' ? `No candidates with status "${filter}".` : 'Start by adding your first candidate.'}
          </p>
          <button onClick={onAddNew} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors">
            Add Candidate
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {candidates.map((c) => (
            <div key={c._id} className={`bg-white rounded-2xl border shadow-sm p-5 flex flex-col gap-4 ${c.hired ? 'border-emerald-200' : 'border-gray-100'}`}>
              {/* Top */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold uppercase shrink-0">
                    {c.name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{c.name}</p>
                    <p className="text-xs text-gray-400 truncate">{c.email}</p>
                  </div>
                </div>
                {c.hired
                  ? <span className="shrink-0 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">Hired</span>
                  : <StatusBadge status={c.status} />
                }
              </div>

              {/* Meta */}
              <div className="space-y-1">
                {c.position && (
                  <p className="text-xs text-gray-500">
                    <span className="text-gray-400">Position: </span>
                    <span className="font-medium text-gray-700">{c.position.title}</span>
                    {c.position.department?.name && <span className="text-gray-400"> · {c.position.department.name}</span>}
                  </p>
                )}
                {c.phone && <p className="text-xs text-gray-400">{c.phone}</p>}
              </div>

              {/* Action error */}
              {actionError[c._id] && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{actionError[c._id]}</p>
              )}

              {/* Actions */}
              {!c.hired && (
                <div className="flex gap-2 pt-1 border-t border-gray-100">
                  <select
                    value={c.status}
                    disabled={updatingId === c._id}
                    onChange={(e) => handleStatusChange(c, e.target.value)}
                    className="flex-1 text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white disabled:opacity-50 capitalize"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s} className="capitalize">{s}</option>
                    ))}
                  </select>
                  {c.status === 'accepted' && (
                    <button
                      onClick={() => handleHire(c)}
                      disabled={hiringId === c._id}
                      className="px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 rounded-xl transition-colors whitespace-nowrap"
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
