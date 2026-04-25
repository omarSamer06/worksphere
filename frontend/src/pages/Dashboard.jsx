import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatCard from '../components/StatCard';
import Loader from '../components/Loader';

/* ── icons ── */
const Ic = ({ d }) => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

const ICONS = {
  calendar:  'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  clock:     'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  check:     'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  users:     'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  building:  'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  briefcase: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  arrow:     'M13 7l5 5m0 0l-5 5m5-5H6',
};

/* ── leave balance bar (employee) ── */
const LeaveBalanceBar = ({ profile, loading }) => {
  if (loading) return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse">
      <div className="h-4 bg-gray-100 rounded w-1/4 mb-4" />
      <div className="h-3 bg-gray-100 rounded-full mb-3" />
      <div className="flex gap-6">
        <div className="h-8 bg-gray-100 rounded w-16" />
        <div className="h-8 bg-gray-100 rounded w-16" />
        <div className="h-8 bg-gray-100 rounded w-16" />
      </div>
    </div>
  );
  if (!profile) return null;

  const { totalLeave = 0, usedLeave = 0, remainingLeave = 0 } = profile;
  const pct = totalLeave > 0 ? Math.min((usedLeave / totalLeave) * 100, 100) : 0;
  const barColor = pct >= 90 ? 'bg-red-500' : pct >= 60 ? 'bg-amber-400' : 'bg-emerald-500';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Leave Balance</p>
          <div className="flex gap-4 flex-wrap text-xs text-gray-500">
            {profile.department && (
              <span><span className="text-gray-400">Dept: </span><span className="font-semibold text-gray-700">{profile.department.name}</span></span>
            )}
            {profile.position && (
              <span><span className="text-gray-400">Position: </span><span className="font-semibold text-gray-700">{profile.position.title}</span></span>
            )}
            {profile.manager && (
              <span><span className="text-gray-400">Manager: </span><span className="font-semibold text-gray-700">{profile.manager.name}</span></span>
            )}
          </div>
        </div>
        <span className="text-xs text-gray-400 font-medium">{Math.round(pct)}% used</span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Total', value: totalLeave, color: 'text-gray-800' },
          { label: 'Used', value: usedLeave, color: 'text-amber-600' },
          { label: 'Remaining', value: remainingLeave, color: 'text-emerald-600' },
        ].map((s) => (
          <div key={s.label} className="text-center p-3 bg-gray-50 rounded-xl">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

/* ── quick action card ── */
const QuickLink = ({ to, icon, label, description, color }) => {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-100',
    green:  'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-100',
    amber:  'bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-100',
    blue:   'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-100',
  };
  return (
    <Link to={to} className={`flex items-center gap-4 p-4 rounded-2xl border transition-colors ${colors[color] ?? colors.indigo}`}>
      <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center shrink-0 shadow-sm">
        <Ic d={ICONS[icon]} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold leading-tight">{label}</p>
        <p className="text-xs opacity-70 mt-0.5 truncate">{description}</p>
      </div>
      <Ic d={ICONS.arrow} />
    </Link>
  );
};

/* ── data hooks ── */
const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    setLoading(true);
    try { const { data } = await api.get('/users/me'); setProfile(data.data); }
    catch { setProfile(null); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { profile, loading };
};

const useAdminStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetch = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [usersRes, leavesRes, deptsRes, candidatesRes] = await Promise.all([
        api.get('/users'), api.get('/leaves'), api.get('/departments'), api.get('/candidates'),
      ]);
      const leaves = leavesRes.data.data;
      const candidates = candidatesRes.data.data;
      setStats({
        totalUsers:      usersRes.data.data.length,
        totalLeaves:     leaves.length,
        pendingLeaves:   leaves.filter((l) => l.status === 'pending').length,
        approvedLeaves:  leaves.filter((l) => l.status === 'approved').length,
        totalDepts:      deptsRes.data.data.length,
        totalCandidates: candidates.length,
        openCandidates:  candidates.filter((c) => !c.hired && c.status !== 'rejected').length,
      });
    } catch { setError('Failed to load statistics.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { stats, loading, error };
};

const useEmployeeStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetch = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await api.get('/leaves/my');
      const leaves = data.data;
      setStats({
        totalLeaves:    leaves.length,
        pendingLeaves:  leaves.filter((l) => l.status === 'pending').length,
        approvedLeaves: leaves.filter((l) => l.status === 'approved').length,
      });
    } catch { setError('Failed to load statistics.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { stats, loading, error };
};

/* ── main ── */
const Dashboard = () => {
  const { user } = useAuth();
  const isEmployee = user?.role === 'employee';
  const isAdmin    = user?.role === 'admin';
  const isManager  = user?.role === 'manager';

  const { profile, loading: profileLoading } = useProfile();
  const adminData    = useAdminStats();
  const employeeData = useEmployeeStats();
  const { stats, loading: statsLoading, error: statsError } = isEmployee ? employeeData : adminData;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="space-y-8">
      {/* ── Welcome ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting}{profile?.name ? `, ${profile.name.split(' ')[0]}` : ''} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isEmployee
              ? "Here's an overview of your leave activity."
              : "Here's what's happening across your organization today."}
          </p>
        </div>
        {user?.exp && (
          <div className="shrink-0 text-right">
            <p className="text-xs text-gray-400">Session expires</p>
            <p className="text-xs font-semibold text-gray-600">
              {new Date(user.exp * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        )}
      </div>

      {/* ── Employee: leave balance ── */}
      {isEmployee && <LeaveBalanceBar profile={profile} loading={profileLoading} />}

      {/* ── Stats ── */}
      {statsError && (
        <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 text-sm text-red-600">
          {statsError}
        </div>
      )}

      {isEmployee ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total Requests" value={stats?.totalLeaves}    icon="calendar" color="indigo" loading={statsLoading} />
          <StatCard label="Pending"        value={stats?.pendingLeaves}  icon="clock"    color="amber"  loading={statsLoading} />
          <StatCard label="Approved"       value={stats?.approvedLeaves} icon="check"    color="green"  loading={statsLoading} />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard label="Employees"   value={stats?.totalUsers}      icon="users"      color="indigo"  loading={statsLoading} />
          <StatCard label="Departments" value={stats?.totalDepts}      icon="building"   color="blue"    loading={statsLoading} />
          <StatCard label="Candidates"  value={stats?.totalCandidates} icon="briefcase"  color="purple"  loading={statsLoading} />
          <StatCard label="Leaves"      value={stats?.totalLeaves}     icon="calendar"   color="slate"   loading={statsLoading} />
          <StatCard label="Pending"     value={stats?.pendingLeaves}   icon="clock"      color="amber"   loading={statsLoading} />
          <StatCard label="Approved"    value={stats?.approvedLeaves}  icon="check"      color="green"   loading={statsLoading} />
        </div>
      )}

      {/* ── Quick actions ── */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">Quick Actions</h2>
        {isEmployee ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <QuickLink to="/attendance"     icon="clock"     label="Attendance"    description="Clock in / clock out"       color="slate"  />
            <QuickLink to="/leaves/request" icon="calendar"  label="Request Leave" description="Submit a new leave request" color="indigo" />
            <QuickLink to="/leaves"         icon="check"     label="My Leaves"     description="View your leave history"    color="green"  />
            <QuickLink to="/payroll"        icon="briefcase" label="Payslips"      description="View salary statements"     color="purple" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <QuickLink to="/attendance"  icon="clock"      label="Attendance"    description="Monitor team punctuality"              color="slate"  />
            <QuickLink to="/leaves"      icon="calendar"   label="Review Leaves" description={`${stats?.pendingLeaves ?? 0} pending`} color="amber"  />
            <QuickLink to="/payroll"     icon="briefcase"  label="Payroll"       description="Generate monthly payroll"              color="green"  />
            {(isAdmin || isManager) && <QuickLink to="/recruitment" icon="users" label="Recruitment" description="Manage candidates" color="blue" />}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
