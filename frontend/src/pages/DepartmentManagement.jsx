import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';

const inputCls = 'w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition';

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create form
  const [form, setForm] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  // Edit state
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  // Delete state
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
    <div className="max-w-3xl">
      <h2 className="text-base font-semibold text-gray-900 mb-6">Department Management</h2>

      {/* Create form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Add New Department</h3>
        {createError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-3">{createError}</p>
        )}
        <form onSubmit={handleCreate} className="space-y-3">
          <input
            type="text"
            required
            placeholder="Department name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className={inputCls}
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            className={inputCls}
          />
          <button
            type="submit"
            disabled={creating}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-lg transition-colors"
          >
            {creating ? 'Creating…' : '+ Add Department'}
          </button>
        </form>
      </div>

      {/* List */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4 flex justify-between">
          {error}
          <button onClick={fetchDepartments} className="text-xs underline">Retry</button>
        </div>
      )}

      {loading ? <Loader /> : departments.length === 0 ? (
        <div className="text-sm text-gray-400 bg-gray-50 border border-gray-100 rounded-xl px-4 py-10 text-center">
          No departments yet. Create one above.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {departments.map((dept) => (
            <div key={dept._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              {editId === dept._id ? (
                <form onSubmit={handleUpdate} className="space-y-2">
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                    className={inputCls}
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={editForm.description}
                    onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                    className={inputCls}
                  />
                  <div className="flex gap-2">
                    <button type="submit" disabled={saving}
                      className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:bg-indigo-400">
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button type="button" onClick={() => setEditId(null)}
                      className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{dept.name}</p>
                    {dept.description && <p className="text-xs text-gray-400 mt-0.5">{dept.description}</p>}
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
      )}
    </div>
  );
};

export default DepartmentManagement;
