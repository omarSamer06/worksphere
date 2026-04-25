import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loader from '../components/Loader';

/* ── shared helpers ── */
const fmt = (d) =>
  d ? new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '—';

const duration = (clockIn, clockOut) => {
  if (!clockIn || !clockOut) return null;
  const ms = new Date(clockOut) - new Date(clockIn);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
};

const StatusBadge = ({ status }) => {
  if (!status) return null;
  const s = status === 'on-time'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : 'bg-red-50 text-red-700 border-red-200';
  const dot = status === 'on-time' ? 'bg-emerald-500' : 'bg-red-500';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${s}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {status === 'on-time' ? 'On Time' : 'Late'}
    </span>
  );
};

/* ══════════════════════════════════════════════
   EMPLOYEE VIEW — clock widget + history
══════════════════════════════════════════════ */

const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="text-center">
      <p className="text-5xl font-bold text-gray-900 tracking-tight tabular-nums">
        {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
      </p>
      <p className="text-sm text-gray-400 mt-1">
        {time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
    </div>
  );
};

const EmployeeAttendance = () => {
  const [today, setToday]         = useState(null);   // today's record
  const [todayLoading, setTodayLoading] = useState(true);
  const [records, setRecords]     = useState([]);
  const [histLoading, setHistLoading] = useState(true);
  const [actioning, setActioning] = useState(null);   // 'in' | 'out'
  const [error, setError]         = useState(null);

  const fetchToday = useCallback(async () => {
    setTodayLoading(true);
    try {
      const { data } = await api.get('/attendance/today');
      setToday(data.data);
    } catch { setToday(null); }
    finally { setTodayLoading(false); }
  }, []);

  const fetchHistory = useCallback(async () => {
    setHistLoading(true);
    try {
      const now = new Date();
      const { data } = await api.get('/attendance/my', {
        params: { month: now.getMonth() + 1, year: now.getFullYear() },
      });
      setRecords(data.data);
    } catch { setRecords([]); }
    finally { setHistLoading(false); }
  }, []);

  useEffect(() => { fetchToday(); fetchHistory(); }, [fetchToday, fetchHistory]);

  const handleClockIn = async () => {
    setActioning('in');
    setError(null);
    try {
      const { data } = await api.post('/attendance/clock-in');
      setToday(data.data);
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Clock-in failed.');
    } finally { setActioning(null); }
  };

  const handleClockOut = async () => {
    setActioning('out');
    setError(null);
    try {
      const { data } = await api.post('/attendance/clock-out');
      setToday(data.data);
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Clock-out failed.');
    } finally { setActioning(null); }
  };

  const hasClockedIn  = !!today?.clockIn;
  const hasClockedOut = !!today?.clockOut;
  const onTime = records.filter((r) => r.status === 'on-time').length;
  const late   = records.filter((r) => r.status === 'late').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Attendance</h1>
        <p className="text-sm text-gray-500 mt-0.5">Track your working hours and attendance history</p>
      </div>

      {/* Clock widget */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <LiveClock />

        {/* Today status */}
        {todayLoading ? (
          <div className="mt-6 flex justify-center"><div className="h-5 w-32 bg-gray-100 rounded animate-pulse" /></div>
        ) : today ? (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Clocked In</p>
              <p className="font-bold text-gray-800">{fmt(today.clockIn)}</p>
            </div>
            {today.clockOut && (
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Clocked Out</p>
                <p className="font-bold text-gray-800">{fmt(today.clockOut)}</p>
              </div>
            )}
            {today.clockOut && duration(today.clockIn, today.clockOut) && (
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Duration</p>
                <p className="font-bold text-gray-800">{duration(today.clockIn, today.clockOut)}</p>
              </div>
            )}
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Status</p>
              <StatusBadge status={today.status} />
            </div>
            {today.shiftSnapshot?.name && (
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Shift</p>
                <p className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  {today.shiftSnapshot.name} · {today.shiftSnapshot.startTime}–{today.shiftSnapshot.endTime}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-sm text-gray-400 mt-6">You haven't clocked in today yet.</p>
        )}

        {/* Error */}
        {error && (
          <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-center">{error}</p>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 mt-8 justify-center">
          <button
            onClick={handleClockIn}
            disabled={hasClockedIn || !!actioning}
            className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
          >
            {actioning === 'in' ? (
              <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> Clocking in…</>
            ) : (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg> Clock In</>
            )}
          </button>
          <button
            onClick={handleClockOut}
            disabled={!hasClockedIn || hasClockedOut || !!actioning}
            className="flex items-center gap-2 px-8 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
          >
            {actioning === 'out' ? (
              <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> Clocking out…</>
            ) : (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg> Clock Out</>
            )}
          </button>
        </div>
      </div>

      {/* This month summary */}
      {!histLoading && records.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Days This Month', value: records.length, color: 'text-indigo-700', bg: 'bg-indigo-50' },
            { label: 'On Time',         value: onTime,          color: 'text-emerald-700', bg: 'bg-emerald-50' },
            { label: 'Late',            value: late,            color: 'text-red-700',     bg: 'bg-red-50' },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-5 text-center border border-white`}>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* History */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">This Month's History</h2>
        {histLoading ? <Loader /> : records.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-sm text-gray-400">No attendance records this month.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Date', 'Clock In', 'Clock Out', 'Duration', 'Shift', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {records.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{fmtDate(r.date)}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmt(r.clockIn)}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmt(r.clockOut)}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{duration(r.clockIn, r.clockOut) ?? '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {r.shiftSnapshot?.name
                        ? <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-medium">{r.shiftSnapshot.name}</span>
                        : <span className="text-gray-300">—</span>
                      }
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   ADMIN / MANAGER VIEW — all attendance records
══════════════════════════════════════════════ */

const AdminAttendance = () => {
  const now = new Date();
  const [records, setRecords]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [month, setMonth]       = useState(now.getMonth() + 1);
  const [year, setYear]         = useState(now.getFullYear());

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { month, year };
      if (statusFilter !== 'all') params.status = statusFilter;
      const { data } = await api.get('/attendance', { params });
      setRecords(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load attendance.');
    } finally { setLoading(false); }
  }, [month, year, statusFilter]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const onTime = records.filter((r) => r.status === 'on-time').length;
  const late   = records.filter((r) => r.status === 'late').length;

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const years  = [now.getFullYear() - 1, now.getFullYear()];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Attendance Overview</h1>
        <p className="text-sm text-gray-500 mt-0.5">Monitor team attendance and punctuality</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Month */}
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))}
          className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
        {/* Year */}
        <select value={year} onChange={(e) => setYear(Number(e.target.value))}
          className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        {/* Status */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {['all', 'on-time', 'late'].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                statusFilter === s ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {s === 'on-time' ? 'On Time' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary pills */}
      {!loading && records.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />{records.length} Records
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{onTime} On Time
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />{late} Late
          </span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 flex items-center justify-between">
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={fetchAll} className="text-xs font-semibold text-red-500 underline">Retry</button>
        </div>
      )}

      {loading ? <Loader /> : records.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-700 mb-1">No attendance records</p>
          <p className="text-xs text-gray-400">No records found for the selected period.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Employee', 'Date', 'Clock In', 'Clock Out', 'Duration', 'Shift', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {records.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold uppercase shrink-0">
                          {r.user?.name?.[0] ?? '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 leading-tight">{r.user?.name ?? '—'}</p>
                          <p className="text-[11px] text-gray-400 capitalize">{r.user?.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-medium whitespace-nowrap">{fmtDate(r.date)}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmt(r.clockIn)}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmt(r.clockOut)}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{duration(r.clockIn, r.clockOut) ?? '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {r.shiftSnapshot?.name
                        ? <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-medium">{r.shiftSnapshot.name}</span>
                        : <span className="text-gray-300 text-xs">No shift</span>
                      }
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════
   ADMIN SHIFT MANAGEMENT
══════════════════════════════════════════════ */

const inputCls = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder-gray-400';

const ShiftManagement = () => {
  const [shifts, setShifts]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [form, setForm]         = useState({ name: '', startTime: '09:00', endTime: '17:00', gracePeriodMinutes: 15 });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [editId, setEditId]     = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving]     = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchShifts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/shifts');
      setShifts(data.data);
    } catch { setError('Failed to load shifts.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchShifts(); }, [fetchShifts]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true); setCreateError(null);
    try {
      const { data } = await api.post('/shifts', form);
      setShifts((p) => [...p, data.data].sort((a, b) => a.name.localeCompare(b.name)));
      setForm({ name: '', startTime: '09:00', endTime: '17:00', gracePeriodMinutes: 15 });
    } catch (err) { setCreateError(err.response?.data?.message || 'Failed to create shift.'); }
    finally { setCreating(false); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put(`/shifts/${editId}`, editForm);
      setShifts((p) => p.map((s) => s._id === editId ? data.data : s).sort((a, b) => a.name.localeCompare(b.name)));
      setEditId(null);
    } catch (err) { setError(err.response?.data?.message || 'Failed to update shift.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this shift?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/shifts/${id}`);
      setShifts((p) => p.filter((s) => s._id !== id));
    } catch (err) { setError(err.response?.data?.message || 'Failed to delete shift.'); }
    finally { setDeletingId(null); }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Shift Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">Define work shifts and assign them to employees</p>
      </div>

      {/* Create form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-bold text-gray-900 mb-4">Add New Shift</h2>
        {createError && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">{createError}</p>}
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Shift Name <span className="text-red-500">*</span></label>
              <input type="text" required placeholder="e.g. Morning Shift" value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Grace Period (min)</label>
              <input type="number" min={0} max={60} value={form.gracePeriodMinutes}
                onChange={(e) => setForm((p) => ({ ...p, gracePeriodMinutes: Number(e.target.value) }))} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Start Time <span className="text-red-500">*</span></label>
              <input type="time" required value={form.startTime}
                onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">End Time <span className="text-red-500">*</span></label>
              <input type="time" required value={form.endTime}
                onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))} className={inputCls} />
            </div>
          </div>
          <button type="submit" disabled={creating}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-xl transition-colors">
            {creating ? 'Creating…' : '+ Add Shift'}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 flex items-center justify-between">
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={fetchShifts} className="text-xs font-semibold text-red-500 underline">Retry</button>
        </div>
      )}

      {loading ? <Loader /> : shifts.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-400">No shifts yet. Create one above.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{shifts.length} Shifts</p>
          </div>
          <div className="divide-y divide-gray-50">
            {shifts.map((s) => (
              <div key={s._id} className="p-5">
                {editId === s._id ? (
                  <form onSubmit={handleUpdate} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input type="text" required value={editForm.name}
                        onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} className={inputCls} />
                      <input type="number" min={0} max={60} value={editForm.gracePeriodMinutes}
                        onChange={(e) => setEditForm((p) => ({ ...p, gracePeriodMinutes: Number(e.target.value) }))}
                        className={inputCls} placeholder="Grace period (min)" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="time" required value={editForm.startTime}
                        onChange={(e) => setEditForm((p) => ({ ...p, startTime: e.target.value }))} className={inputCls} />
                      <input type="time" required value={editForm.endTime}
                        onChange={(e) => setEditForm((p) => ({ ...p, endTime: e.target.value }))} className={inputCls} />
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" disabled={saving}
                        className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-xl transition-colors">
                        {saving ? 'Saving…' : 'Save'}
                      </button>
                      <button type="button" onClick={() => setEditId(null)}
                        className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{s.name}</p>
                        <p className="text-xs text-gray-400">{s.startTime} – {s.endTime} · {s.gracePeriodMinutes}min grace</p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => { setEditId(s._id); setEditForm({ name: s.name, startTime: s.startTime, endTime: s.endTime, gracePeriodMinutes: s.gracePeriodMinutes }); }}
                        className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(s._id)} disabled={deletingId === s._id}
                        className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50">
                        {deletingId === s._id ? '…' : 'Delete'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════
   ROOT — role-aware entry point
══════════════════════════════════════════════ */

const ADMIN_VIEWS = [
  { id: 'attendance', label: 'All Attendance' },
  { id: 'shifts',     label: 'Shifts'         },
];

const AttendancePage = () => {
  const { user } = useAuth();
  const isEmployee = user?.role === 'employee';
  const [view, setView] = useState('attendance');

  if (isEmployee) return <EmployeeAttendance />;

  return (
    <div className="space-y-6">
      {/* Sub-nav for admin/manager */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {ADMIN_VIEWS.map((v) => (
          // managers don't need shift management
          (v.id === 'shifts' && user?.role === 'manager') ? null :
          <button key={v.id} onClick={() => setView(v.id)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              view === v.id ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {v.label}
          </button>
        ))}
      </div>

      {view === 'attendance' ? <AdminAttendance /> : <ShiftManagement />}
    </div>
  );
};

export default AttendancePage;
