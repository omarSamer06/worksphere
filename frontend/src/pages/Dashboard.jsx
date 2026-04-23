import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MyLeaves from './MyLeaves';
import RequestLeave from './RequestLeave';
import AllLeaves from './AllLeaves';

const roleBadgeColor = {
  admin:    'bg-red-100 text-red-700',
  manager:  'bg-amber-100 text-amber-700',
  employee: 'bg-green-100 text-green-700',
};

const employeeTabs = [
  { id: 'my-leaves',      label: 'My Leaves' },
  { id: 'request-leave',  label: 'Request Leave' },
];

const adminTabs = [
  { id: 'all-leaves', label: 'All Leaves' },
];

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isEmployee = user?.role === 'employee';
  const tabs = isEmployee ? employeeTabs : adminTabs;
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'my-leaves':     return <MyLeaves />;
      case 'request-leave': return <RequestLeave />;
      case 'all-leaves':    return <AllLeaves />;
      default:              return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white rounded-lg p-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900 text-lg">HR System</span>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                roleBadgeColor[user?.role] ?? 'bg-gray-100 text-gray-600'
              }`}
            >
              {user?.role ?? 'Unknown'}
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome bar */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-0.5 text-sm">
            {isEmployee
              ? 'Manage your leave requests below.'
              : 'Review and manage all employee leave requests.'}
          </p>
        </div>

        {/* Session cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">User ID</p>
            <p className="text-xs font-mono text-gray-600 truncate">{user?.id ?? '—'}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Role</p>
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                roleBadgeColor[user?.role] ?? 'bg-gray-100 text-gray-600'
              }`}
            >
              {user?.role ?? 'Unknown'}
            </span>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Session expires</p>
            <p className="text-sm font-semibold text-gray-700">
              {user?.exp
                ? new Date(user.exp * 1000).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })
                : '—'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-1 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
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

        {/* Tab content */}
        <div>{renderTab()}</div>
      </div>
    </div>
  );
};

export default Dashboard;
