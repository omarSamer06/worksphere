import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const inputCls =
  'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder-gray-400';

const DEMO_ACCOUNTS = [
  {
    role: 'Admin',
    email: 'admin@test.com',
    description: 'Full system access',
    badge: 'bg-red-100 text-red-700 ring-red-200',
    btn: 'hover:border-red-200 hover:bg-red-50/50',
    dot: 'bg-red-400',
  },
  {
    role: 'Manager',
    email: 'manager@test.com',
    description: 'Approve leaves & manage team',
    badge: 'bg-amber-100 text-amber-700 ring-amber-200',
    btn: 'hover:border-amber-200 hover:bg-amber-50/50',
    dot: 'bg-amber-400',
  },
  {
    role: 'Employee',
    email: 'employee@test.com',
    description: 'Submit & track leave requests',
    badge: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
    btn: 'hover:border-emerald-200 hover:bg-emerald-50/50',
    dot: 'bg-emerald-500',
  },
];

const Spinner = () => (
  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
);

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, token } = useAuth();

  const [form, setForm]         = useState({ email: '', password: '' });
  const [loading, setLoading]   = useState(false);   // manual form submit
  const [demoLoading, setDemoLoading] = useState(null); // which demo role is loading
  const [error, setError]       = useState(null);

  const from = location.state?.from?.pathname || '/dashboard';
  if (token) return <Navigate to="/dashboard" replace />;

  /* ── helpers ── */
  const doLogin = async (credentials) => {
    const { data } = await api.post('/api/v1/auth/login', credentials);
    login(data.data.token);
    navigate('/dashboard', { replace: true });
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await doLogin(form);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (account) => {
    setDemoLoading(account.role);
    setError(null);
    try {
      await doLogin({ email: account.email, password: '123456' });
    } catch (err) {
      setError(err.response?.data?.message || `Demo login failed. Make sure the "${account.role}" account exists.`);
      setDemoLoading(null);
    }
  };

  const anyLoading = loading || !!demoLoading;

  return (
    <div className="min-h-screen flex">
      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-[45%] bg-slate-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-indigo-500/10 rounded-full" />
        <div className="absolute bottom-10 -right-16 w-64 h-64 bg-indigo-500/10 rounded-full" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <span className="text-white font-bold text-lg">HR System</span>
          </div>

          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Manage your<br />workforce with ease
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-xs">
            A complete HR platform for leave management, recruitment, and employee organization.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {[
            'Leave management & approvals',
            'Recruitment pipeline',
            'Department & position tracking',
          ].map((text) => (
            <div key={text} className="flex items-center gap-3">
              <span className="text-indigo-400 text-xs">✦</span>
              <span className="text-slate-400 text-sm">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <span className="font-bold text-gray-900">HR System</span>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-500 text-sm mt-1">Sign in to your account to continue</p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3.5">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* Manual login form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                id="email" name="email" type="email" autoComplete="email" required
                value={form.email} onChange={handleChange} placeholder="you@company.com"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                id="password" name="password" type="password" autoComplete="current-password" required
                value={form.password} onChange={handleChange} placeholder="••••••••"
                className={inputCls}
              />
            </div>
            <button
              type="submit"
              disabled={anyLoading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2"><Spinner /> Signing in…</span>
              ) : 'Sign in'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs font-medium text-gray-400">or try a demo</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Demo section */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            {/* Demo header */}
            <div className="px-4 pt-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-sm font-bold text-gray-900">Try Demo Accounts</p>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                This is a demo system. Accounts are pre-created for testing.
              </p>
            </div>

            {/* Demo buttons */}
            <div className="p-3 space-y-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.role}
                  type="button"
                  disabled={anyLoading}
                  onClick={() => handleDemoLogin(account)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border border-gray-100 bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${account.btn}`}
                >
                  {/* Role indicator */}
                  <span className={`w-2 h-2 rounded-full shrink-0 ${account.dot}`} />

                  {/* Text */}
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md ring-1 ${account.badge}`}>
                        {account.role}
                      </span>
                      <span className="text-xs text-gray-400 font-mono truncate">{account.email}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">{account.description}</p>
                  </div>

                  {/* Action indicator */}
                  <div className="shrink-0 w-6 h-6 flex items-center justify-center">
                    {demoLoading === account.role ? (
                      <Spinner />
                    ) : (
                      <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Password hint */}
            <div className="px-4 pb-3 pt-1">
              <p className="text-[11px] text-gray-400 text-center">
                All demo accounts use password{' '}
                <span className="font-mono font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">123456</span>
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-6">
            &copy; {new Date().getFullYear()} HR Management System
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
