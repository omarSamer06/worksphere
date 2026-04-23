import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatCard from '../components/StatCard';
import MyLeaves from './MyLeaves';
import RequestLeave from './RequestLeave';
import AllLeaves from './AllLeaves';

const roleBadgeColor = {
  admin:    'bg-red-100 text-red-700',
  manager:  'bg-amber-100 text-amber-700',
  employee: 'bg-green-100 text-green-700',
};

const employeeTabs = [
  { id: 'my-leaves',     label: 'My Leaves'     },
  { id: 'request-leave', label: 'Request Leave' },
];

const adminTabs = [
  { id: 'all-leaves', label: 'All Leaves' },
];

/* ── icons ── */
const IconUsers = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IconCalendar = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const IconClock = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconCheck = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconShield = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

/* ── leave balance bar ── */
const LeaveBalanceBar = ({ profile, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
        <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
        <div className="h-2.5 bg-gray-100 rounded-full" />
      </div>
    );
  }
  if (!profile) return null;

  const { totalLeave, usedLeave, remainingLeave } = profile;
  const pct = totalLeave > 0 ? Math.min((usedLeave / totalLeave) * 100, 100) : 0;
  const barColor = pct >= 90 ? 'bg-red-500' : pct >= 60 ? 'bg-amber-400' : 'bg-green-500';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Leave Balance</p>
        {profile.manager && (
          <p className="text-xs text-gray-400">
            Manager: <span className="font-medium text-gray-600">{profile.manager.name}</span>
          </p>
        )}
      </div>
      <div className="flex items-end justify-between mb-2">
        <div className="flex gap-5">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Total</p>
            <p className="text-xl font-bold text-gray-800">{totalLeave}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Used</p>
            <p className="text-xl font-bold text-amber-600">{usedLeave}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Remaining</p>
            <p className="text-xl font-bold text-green-600">{remainingLeave}</p>
          </div>
        </div>
        <p className="text-xs text-gray-400">{Math.round(pct)}% used</p>
      </div>
      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

/* ── data hooks ── */
const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users/me');
      setProfile(data.data);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { profile, loading, refetch: fetch };
};

const useAdminStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, leavesRes] = await Promise.all([
        api.get('/users'),
        api.get('/leaves'),
      ]);
      const leaves = leavesRes.data.data;
      setStats({
        totalUsers:     usersRes.data.data.length,
        totalLeaves:    leaves.length,
        pendingLeaves:  leaves.filter((l) => l.status === 'pending').length,
        approvedLeaves: leaves.filter((l) => l.status === 'approved').length,
      });
    } catch {
      setError('Failed to load statistics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { stats, loading, error, refetch: fetch };
};

const useEmployeeStats = (profile) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/leaves/my');
      const leaves = data.data;
      setStats({
        totalLeaves:    leaves.length,
        pendingLeaves:  leaves.filter((l) => l.status === 'pending').length,
        approvedLeaves: leaves.filter((l) => l.status === 'approved').length,
      });
    } catch {
      setError('Failed to load statistics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { stats, loading, error, refetch: fetch };
};

/* ── main ── */
const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isEmployee = user?.role === 'employee';
  const tabs = isEmployee ? employeeTabs : adminTabs;
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  const { profile, loading: profileLoading, refetch: refetchProfile } = useProfile();

  const adminData    = useAdminStats();
  const employeeData = useEmployeeStats(profile);
  const { stats, loading: statsLoading, error: statsError, refetch: refetchStats } =
    isEmployee ? employeeData : adminData;

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleLeaveChange = () => {
    refetchStats();
    if (isEmployee) refetchProfile();
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'my-leaves':
        return <MyLeaves onLeaveChange={handleLeaveChange} />;
      case 'request-leave':
        return (
          <RequestLeave
            onLeaveSubmit={handleLeaveChange}
            remainingLeave={profile?.remainingLeave}
          />
        );
      case 'all-leaves':
        return <AllLeaves onLeaveChange={handleLeaveChange} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white rounded-xl p-2">
              <IconUsers />
            </div>
            <div>
              <span className="font-bold text-gray-900 text-base leading-tight block">HR System</span>
              <span className="text-xs text-gray-400">Management Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-mono text-gray-400 truncate max-w-[120px]">{user?.id}</span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize mt-0.5 ${
                  roleBadgeColor[user?.role] ?? 'bg-gray-100 text-gray-600'
                }`}
              >
                {user?.role ?? 'Unknown'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* ── Welcome ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEmployee ? 'My Dashboard' : 'Admin Dashboard'}
            </h1>
            <p className="text-gray-500 mt-0.5 text-sm">
              {isEmployee
                ? 'Track and manage your leave requests.'
                : 'Oversee team leave requests and manage employees.'}
            </p>
          </div>
          <p className="text-xs text-gray-400">
            Session expires{' '}
            <span className="font-medium text-gray-600">
              {user?.exp
                ? new Date(user.exp * 1000).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })
                : '—'}
            </span>
          </p>
        </div>

        {/* ── Leave balance (employee only) ── */}
        {isEmployee && (
          <LeaveBalanceBar profile={profile} loading={profileLoading} />
        )}

        {/* ── Stats ── */}
        {statsError && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            {statsError}
          </div>
        )}

        {isEmployee ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Total Requests" value={stats?.totalLeaves}    icon={<IconCalendar />} color="indigo" loading={statsLoading} />
            <StatCard label="Pending"         value={stats?.pendingLeaves}  icon={<IconClock />}    color="amber"  loading={statsLoading} />
            <StatCard label="Approved"        value={stats?.approvedLeaves} icon={<IconCheck />}    color="green"  loading={statsLoading} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Users"     value={stats?.totalUsers}     icon={<IconUsers />}    color="indigo" loading={statsLoading} />
            <StatCard label="Total Leaves"    value={stats?.totalLeaves}    icon={<IconCalendar />} color="blue"   loading={statsLoading} />
            <StatCard label="Pending"         value={stats?.pendingLeaves}  icon={<IconClock />}    color="amber"  loading={statsLoading} />
            <StatCard label="Approved"        value={stats?.approvedLeaves} icon={<IconCheck />}    color="green"  loading={statsLoading} />
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 px-6">
            <nav className="flex gap-1 -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="p-6">{renderTab()}</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
