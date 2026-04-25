import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';

/* ── helpers ── */
const fmtCurrency = (n) =>
  typeof n === 'number'
    ? n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 })
    : '—';

const ROLE_BADGE = {
  admin:    'bg-red-100 text-red-700 ring-red-200',
  manager:  'bg-amber-100 text-amber-700 ring-amber-200',
  employee: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
};

const inputCls =
  'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder-gray-400';

const selectCls =
  'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition';

const Avatar = ({ name }) => (
  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold uppercase shrink-0">
    {name?.[0] ?? '?'}
  </div>
);

/* ── slide-over edit panel ── */
const EditPanel = ({ user, departments, positions, onClose, onSaved }) => {
  const [form, setForm] = useState({
    role:       user.role ?? 'employee',
    department: user.department?._id ?? user.department ?? '',
    position:   user.position?._id   ?? user.position   ?? '',
    salary:     user.salary ?? 0,
    totalLeave: user.totalLeave ?? 20,
    manager:    user.manager?._id    ?? user.manager    ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState(null);

  const managers = [];   // will be populated from parent's users list — passed via prop if needed

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        role:       form.role,
        department: form.department || null,
        position:   form.position   || null,
        salary:     Number(form.salary),
        totalLeave: Number(form.totalLeave),
        manager:    form.manager    || null,
      };
      const { data } = await api.put(`/users/${user._id}`, payload);
      onSaved(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user.');
    } finally {
      setSaving(false);
    }
  };

  return (
    /* backdrop */
    <div className="fixed inset-0 z-50 flex justify-end" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* panel */}
      <div className="relative z-10 w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-[slideInRight_0.2s_ease-out]">
        {/* header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
          <Avatar name={user.name} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          {/* Role */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Role</label>
            <select value={form.role} onChange={set('role')} className={selectCls}>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Department</label>
            <select value={form.department} onChange={set('department')} className={selectCls}>
              <option value="">— None —</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Position */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Position</label>
            <select value={form.position} onChange={set('position')} className={selectCls}>
              <option value="">— None —</option>
              {positions.map((p) => (
                <option key={p._id} value={p._id}>{p.title}</option>
              ))}
            </select>
          </div>

          {/* Salary */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Monthly Salary (USD)</label>
            <input
              type="number"
              min={0}
              step={100}
              value={form.salary}
              onChange={set('salary')}
              className={inputCls}
              placeholder="0"
            />
          </div>

          {/* Leave entitlement */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Annual Leave Entitlement (days)</label>
            <input
              type="number"
              min={0}
              max={365}
              value={form.totalLeave}
              onChange={set('totalLeave')}
              className={inputCls}
              placeholder="20"
            />
          </div>
        </form>

        {/* footer */}
        <div className="px-6 py-5 border-t border-gray-100 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {saving && (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── main page ── */
const Users = () => {
  const [users,       setUsers]       = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions,   setPositions]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [editing,     setEditing]     = useState(null);   // user object being edited
  const [search,      setSearch]      = useState('');
  const [roleFilter,  setRoleFilter]  = useState('all');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, deptsRes, posRes] = await Promise.all([
        api.get('/users'),
        api.get('/departments'),
        api.get('/positions'),
      ]);
      setUsers(usersRes.data.data);
      setDepartments(deptsRes.data.data);
      setPositions(posRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSaved = (updatedUser) => {
    setUsers((prev) => prev.map((u) => u._id === updatedUser._id ? updatedUser : u));
    setEditing(null);
  };

  /* filtered list */
  const filtered = users.filter((u) => {
    const matchSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  /* summary counts */
  const counts = {
    total:    users.length,
    admin:    users.filter((u) => u.role === 'admin').length,
    manager:  users.filter((u) => u.role === 'manager').length,
    employee: users.filter((u) => u.role === 'employee').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage employee profiles, roles, departments, and salaries</p>
        </div>
      </div>

      {/* Summary pills */}
      {!loading && (
        <div className="flex flex-wrap gap-2">
          {[
            { label: `${counts.total} Total`,    color: 'bg-gray-100 text-gray-600', key: 'all' },
            { label: `${counts.employee} Employees`, color: 'bg-emerald-50 text-emerald-700 border border-emerald-200', key: 'employee' },
            { label: `${counts.manager} Managers`,   color: 'bg-amber-50 text-amber-700 border border-amber-200',   key: 'manager'  },
            { label: `${counts.admin} Admins`,        color: 'bg-red-50 text-red-700 border border-red-200',          key: 'admin'    },
          ].map((p) => (
            <button
              key={p.key}
              onClick={() => setRoleFilter(p.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${p.color} ${roleFilter === p.key ? 'ring-2 ring-offset-1 ring-indigo-400' : 'opacity-80 hover:opacity-100'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 flex items-center justify-between">
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={fetchAll} className="text-xs font-semibold text-red-500 underline">Retry</button>
        </div>
      )}

      {/* Table */}
      {loading ? <Loader /> : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-700">No users found</p>
          <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[750px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Employee', 'Role', 'Department', 'Position', 'Salary', 'Leave', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50/60 transition-colors group">
                    {/* Employee */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} />
                        <div>
                          <p className="font-semibold text-gray-800 leading-tight">{u.name}</p>
                          <p className="text-[11px] text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ring-1 capitalize ${ROLE_BADGE[u.role] ?? 'bg-gray-100 text-gray-600 ring-gray-200'}`}>
                        {u.role}
                      </span>
                    </td>

                    {/* Department */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-gray-600 text-xs">
                      {u.department?.name ?? <span className="text-gray-300">—</span>}
                    </td>

                    {/* Position */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-gray-600 text-xs">
                      {u.position?.title ?? <span className="text-gray-300">—</span>}
                    </td>

                    {/* Salary */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {u.salary > 0
                        ? <span className="font-semibold text-gray-800">{fmtCurrency(u.salary)}</span>
                        : <span className="text-gray-300 text-xs">Not set</span>}
                    </td>

                    {/* Leave */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-400 rounded-full"
                            style={{ width: `${u.totalLeave > 0 ? Math.min((u.usedLeave / u.totalLeave) * 100, 100) : 0}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-gray-400">
                          {u.usedLeave ?? 0}/{u.totalLeave ?? 20}d
                        </span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-right">
                      <button
                        onClick={() => setEditing(u)}
                        className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="px-4 py-3 border-t border-gray-50 bg-gray-50/50">
            <p className="text-xs text-gray-400">
              Showing <span className="font-semibold text-gray-600">{filtered.length}</span> of{' '}
              <span className="font-semibold text-gray-600">{users.length}</span> users
            </p>
          </div>
        </div>
      )}

      {/* Edit panel */}
      {editing && (
        <EditPanel
          user={editing}
          departments={departments}
          positions={positions}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

export default Users;
