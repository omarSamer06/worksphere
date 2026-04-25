import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loader from '../components/Loader';

/* ── helpers ── */
const fmtCurrency = (n) =>
  typeof n === 'number'
    ? n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })
    : '—';

const fmtMonth = (m) => {
  if (!m) return '—';
  const [yr, mo] = m.split('-').map(Number);
  return new Date(yr, mo - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

const currentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

/* ── status pill ── */
const Pill = ({ label, color }) => {
  const map = {
    green:  'bg-emerald-50 text-emerald-700 border-emerald-200',
    red:    'bg-red-50 text-red-700 border-red-200',
    amber:  'bg-amber-50 text-amber-700 border-amber-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    gray:   'bg-gray-100 text-gray-600 border-gray-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${map[color] ?? map.gray}`}>
      {label}
    </span>
  );
};

/* ══════════════════════════════════════════════
   PAYSLIP CARD — single payroll record detail
══════════════════════════════════════════════ */
const PayslipCard = ({ record, onClose }) => {
  if (!record) return null;
  const user = record.user ?? {};
  const net  = record.finalSalary ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header band */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-8 py-7 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-200 mb-1">Payslip</p>
              <h2 className="text-2xl font-bold">{fmtMonth(record.month)}</h2>
            </div>
            <button
              onClick={onClose}
              className="mt-1 w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* Employee info */}
          <div className="mt-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center text-sm font-bold uppercase">
              {user.name?.[0] ?? '?'}
            </div>
            <div>
              <p className="font-semibold leading-tight">{user.name ?? '—'}</p>
              <p className="text-indigo-200 text-xs capitalize">{user.role} · {user.email}</p>
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="px-8 py-6 space-y-3">
          {[
            { label: 'Base Salary',    value: fmtCurrency(record.baseSalary), color: 'text-gray-900' },
            { label: 'Approved Leave Days', value: `${record.leaveDays ?? 0} day(s)`, color: 'text-gray-700' },
            { label: 'Leave Deductions',    value: `− ${fmtCurrency(record.deductions)}`, color: 'text-red-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500">{label}</span>
              <span className={`text-sm font-semibold ${color}`}>{value}</span>
            </div>
          ))}

          {/* Net pay */}
          <div className="mt-4 bg-indigo-50 rounded-2xl px-5 py-4 flex items-center justify-between">
            <p className="text-sm font-bold text-indigo-700">Net Pay</p>
            <p className="text-2xl font-bold text-indigo-700">{fmtCurrency(net)}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-7 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   EMPLOYEE VIEW — my payslips list
══════════════════════════════════════════════ */
const EmployeePayroll = () => {
  const [records, setRecords]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/payroll/my');
        setRecords(data.data);
      } catch { /* silent */ }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">My Payslips</h1>
        <p className="text-sm text-gray-500 mt-0.5">View your monthly salary statements</p>
      </div>

      {loading ? <Loader /> : records.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-700">No payslips yet</p>
          <p className="text-xs text-gray-400 mt-1">Your payslips will appear here once payroll is generated.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {records.map((r) => {
            const deducted = (r.deductions ?? 0) > 0;
            return (
              <button
                key={r._id}
                onClick={() => setSelected(r)}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all text-left p-6 space-y-4"
              >
                {/* Month badge */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                    {fmtMonth(r.month)}
                  </span>
                  {deducted && <Pill label="Deductions applied" color="amber" />}
                </div>

                {/* Net salary */}
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Net Pay</p>
                  <p className="text-2xl font-bold text-gray-900">{fmtCurrency(r.finalSalary)}</p>
                </div>

                {/* Mini breakdown */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-500">
                    <span>Base Salary</span>
                    <span className="font-medium text-gray-700">{fmtCurrency(r.baseSalary)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Leave Deductions</span>
                    <span className={`font-medium ${deducted ? 'text-red-600' : 'text-gray-700'}`}>
                      − {fmtCurrency(r.deductions)}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-indigo-400 group-hover:text-indigo-600 font-medium transition-colors">
                  View payslip →
                </p>
              </button>
            );
          })}
        </div>
      )}

      {selected && <PayslipCard record={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

/* ══════════════════════════════════════════════
   ADMIN VIEW — generate + all records table
══════════════════════════════════════════════ */
const AdminPayroll = () => {
  const now = new Date();
  const [records, setRecords]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [selected, setSelected]     = useState(null);
  const [genMonth, setGenMonth]     = useState(currentMonth());
  const [generating, setGenerating] = useState(false);
  const [genSuccess, setGenSuccess] = useState(null);
  const [genError, setGenError]     = useState(null);
  const [filterMonth, setFilterMonth] = useState('');

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const years  = [now.getFullYear() - 1, now.getFullYear()];

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = filterMonth ? { month: filterMonth } : {};
      const { data } = await api.get('/payroll', { params });
      setRecords(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load payroll records.');
    } finally { setLoading(false); }
  }, [filterMonth]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleGenerate = async () => {
    setGenerating(true);
    setGenSuccess(null);
    setGenError(null);
    try {
      const { data } = await api.post('/payroll/generate', { month: genMonth });
      setGenSuccess(data.message);
      fetchAll();
    } catch (err) {
      setGenError(err.response?.data?.message || 'Payroll generation failed.');
    } finally { setGenerating(false); }
  };

  // Group by month for totals
  const totalPayroll = records.reduce((sum, r) => sum + (r.finalSalary ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Payroll Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">Generate and review monthly payroll for all employees</p>
      </div>

      {/* Generate panel */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-bold text-gray-900 mb-4">Generate Payroll</h2>
        <p className="text-xs text-gray-400 mb-5 leading-relaxed">
          Calculates each employee's net pay based on their base salary and approved leave deductions for the selected month.
          Running it again for the same month will overwrite previous results.
        </p>

        {genSuccess && (
          <div className="mb-4 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {genSuccess}
          </div>
        )}
        {genError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{genError}</div>
        )}

        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Month</label>
            <input
              type="month"
              value={genMonth}
              onChange={(e) => setGenMonth(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            {generating ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Generating…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Generate Payroll
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter + summary */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-3 items-center">
          <label className="text-xs font-medium text-gray-500">Filter by month:</label>
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {filterMonth && (
            <button onClick={() => setFilterMonth('')}
              className="text-xs text-gray-400 hover:text-gray-600 underline">Clear</button>
          )}
        </div>

        {!loading && records.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">{records.length} records</span>
            <span className="text-gray-200">·</span>
            <span className="font-bold text-gray-900">{fmtCurrency(totalPayroll)} total</span>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 flex justify-between items-center">
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={fetchAll} className="text-xs font-semibold text-red-500 underline">Retry</button>
        </div>
      )}

      {loading ? <Loader /> : records.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-700">No payroll records</p>
          <p className="text-xs text-gray-400 mt-1">Generate payroll above to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Employee', 'Month', 'Base Salary', 'Leave Days', 'Deductions', 'Net Pay', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {records.map((r) => {
                  const user     = r.user ?? {};
                  const deducted = (r.deductions ?? 0) > 0;
                  return (
                    <tr key={r._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold uppercase shrink-0">
                            {user.name?.[0] ?? '?'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 leading-tight">{user.name ?? '—'}</p>
                            <p className="text-[11px] text-gray-400 capitalize">{user.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                          {fmtMonth(r.month)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 font-medium whitespace-nowrap">{fmtCurrency(r.baseSalary)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {r.leaveDays > 0
                          ? <Pill label={`${r.leaveDays}d`} color="amber" />
                          : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {deducted
                          ? <span className="text-red-600 font-medium">− {fmtCurrency(r.deductions)}</span>
                          : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-bold text-gray-900">{fmtCurrency(r.finalSalary)}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <button
                          onClick={() => setSelected(r)}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                        >
                          Payslip
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && <PayslipCard record={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

/* ══════════════════════════════════════════════
   ROOT — role-aware entry point
══════════════════════════════════════════════ */
const PayrollPage = () => {
  const { user } = useAuth();
  return user?.role === 'employee' ? <EmployeePayroll /> : <AdminPayroll />;
};

export default PayrollPage;
