import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';

const inputCls = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder-gray-400';

const PositionManagement = () => {
  const [positions, setPositions]   = useState([]);
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  const [form, setForm]           = useState({ title: '', department: '', manager: '' });
  const [creating, setCreating]   = useState(false);
  const [createError, setCreateError] = useState(null);

  const [editId, setEditId]       = useState(null);
  const [editForm, setEditForm]   = useState({ title: '', department: '', manager: '' });
  const [saving, setSaving]       = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [posRes, deptRes, userRes] = await Promise.all([
        api.get('/positions'), api.get('/departments'), api.get('/users'),
      ]);
      setPositions(posRes.data.data);
      setDepartments(deptRes.data.data);
      setManagers(userRes.data.data.filter((u) => u.role === 'manager' || u.role === 'admin'));
    } catch {
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      const { data } = await api.post('/positions', {
        title: form.title,
        department: form.department || undefined,
        manager: form.manager || undefined,
      });
      setPositions((prev) => [...prev, data.data].sort((a, b) => a.title.localeCompare(b.title)));
      setForm({ title: '', department: '', manager: '' });
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create position.');
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (pos) => {
    setEditId(pos._id);
    setEditForm({ title: pos.title, department: pos.department?._id || '', manager: pos.manager?._id || '' });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put(`/positions/${editId}`, {
        title: editForm.title,
        department: editForm.department || null,
        manager: editForm.manager || null,
      });
      setPositions((prev) =>
        prev.map((p) => (p._id === editId ? data.data : p)).sort((a, b) => a.title.localeCompare(b.title))
      );
      setEditId(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update position.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this position?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/positions/${id}`);
      setPositions((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete position.');
    } finally {
      setDeletingId(null);
    }
  };

  const deptOptions = departments.map((d) => ({ _id: d._id, label: d.name }));
  const mgrOptions  = managers.map((m) => ({ _id: m._id, label: `${m.name} (${m.role})` }));

  const Sel = ({ value, onChange, options, placeholder }) => (
    <select value={value} onChange={onChange} className={inputCls}>
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o._id} value={o._id}>{o.label}</option>)}
    </select>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Positions</h1>
        <p className="text-sm text-gray-500 mt-0.5">Define and manage job positions within the organization</p>
      </div>

      {/* Create form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-bold text-gray-900 mb-4">Add New Position</h2>
        {createError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">{createError}</p>
        )}
        <form onSubmit={handleCreate} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Title <span className="text-red-500">*</span></label>
            <input type="text" required placeholder="e.g. Senior Engineer" value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className={inputCls} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Department</label>
              <Sel value={form.department} onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                options={deptOptions} placeholder="Select department (optional)" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Manager</label>
              <Sel value={form.manager} onChange={(e) => setForm((p) => ({ ...p, manager: e.target.value }))}
                options={mgrOptions} placeholder="Select manager (optional)" />
            </div>
          </div>
          <button type="submit" disabled={creating}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-xl transition-colors">
            {creating ? 'Creating…' : '+ Add Position'}
          </button>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 flex items-center justify-between">
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={fetchAll} className="text-xs font-semibold text-red-500 underline">Retry</button>
        </div>
      )}

      {/* List */}
      {loading ? <Loader /> : positions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500">No positions yet. Create one above.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{positions.length} Positions</p>
          </div>
          <div className="divide-y divide-gray-50">
            {positions.map((pos) => (
              <div key={pos._id} className="p-5">
                {editId === pos._id ? (
                  <form onSubmit={handleUpdate} className="space-y-3">
                    <input type="text" required value={editForm.title}
                      onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))} className={inputCls} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <select value={editForm.department} onChange={(e) => setEditForm((p) => ({ ...p, department: e.target.value }))} className={inputCls}>
                        <option value="">No department</option>
                        {deptOptions.map((o) => <option key={o._id} value={o._id}>{o.label}</option>)}
                      </select>
                      <select value={editForm.manager} onChange={(e) => setEditForm((p) => ({ ...p, manager: e.target.value }))} className={inputCls}>
                        <option value="">No manager</option>
                        {mgrOptions.map((o) => <option key={o._id} value={o._id}>{o.label}</option>)}
                      </select>
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
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold uppercase shrink-0">
                        {pos.title[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800">{pos.title}</p>
                        <div className="flex gap-3 mt-0.5">
                          {pos.department && (
                            <span className="text-xs text-gray-400"><span className="text-gray-300">Dept:</span> {pos.department.name}</span>
                          )}
                          {pos.manager && (
                            <span className="text-xs text-gray-400"><span className="text-gray-300">Mgr:</span> {pos.manager.name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => startEdit(pos)}
                        className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(pos._id)} disabled={deletingId === pos._id}
                        className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50">
                        {deletingId === pos._id ? '…' : 'Delete'}
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

export default PositionManagement;
