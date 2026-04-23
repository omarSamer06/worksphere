import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';

const inputCls = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder-gray-400';

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/departments');
      setDepartments(data.data);
    } catch {
      setError('Failed to load departments.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDepartments(); }, [fetchDepartments]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      const { data } = await api.post('/departments', form);
      setDepartments((prev) => [...prev, data.data].sort((a, b) => a.name.localeCompare(b.name)));
      setForm({ name: '', description: '' });
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create department.');
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (dept) => {
    setEditId(dept._id);
    setEditForm({ name: dept.name, description: dept.description || '' });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put(`/departments/${editId}`, editForm);
      setDepartments((prev) =>
        prev.map((d) => (d._id === editId ? data.data : d)).sort((a, b) => a.name.localeCompare(b.name))
      );
      setEditId(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update department.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/departments/${id}`);
      setDepartments((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete department.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Departments</h1>
        <p className="text-sm text-gray-500 mt-0.5">Create and manage company departments</p>
      </div>

      {/* Create form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-bold text-gray-900 mb-4">Add New Department</h2>
        {createError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">{createError}</p>
        )}
        <form onSubmit={handleCreate} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Name <span className="text-red-500">*</span></label>
              <input type="text" required placeholder="e.g. Engineering" value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Description</label>
              <input type="text" placeholder="Optional description" value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className={inputCls} />
            </div>
          </div>
          <button type="submit" disabled={creating}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-xl transition-colors">
            {creating ? 'Creating…' : '+ Add Department'}
          </button>
        </form>
      </div>

      {/* List */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 flex items-center justify-between">
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={fetchDepartments} className="text-xs font-semibold text-red-500 underline">Retry</button>
        </div>
      )}

      {loading ? <Loader /> : departments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500">No departments yet. Create one above.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{departments.length} Departments</p>
          </div>
          <div className="divide-y divide-gray-50">
            {departments.map((dept) => (
              <div key={dept._id} className="p-5">
                {editId === dept._id ? (
                  <form onSubmit={handleUpdate} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input type="text" required value={editForm.name}
                        onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} className={inputCls} />
                      <input type="text" placeholder="Description" value={editForm.description}
                        onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))} className={inputCls} />
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
                      <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold uppercase shrink-0">
                        {dept.name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800">{dept.name}</p>
                        {dept.description && <p className="text-xs text-gray-400 truncate">{dept.description}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => startEdit(dept)}
                        className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(dept._id)} disabled={deletingId === dept._id}
                        className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50">
                        {deletingId === dept._id ? '…' : 'Delete'}
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

export default DepartmentManagement;
