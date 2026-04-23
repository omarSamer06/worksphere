import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ── icons ── */
const Ic = ({ d, className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

const ICONS = {
  home:       'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  calendar:   'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  plus:       'M12 4v16m8-8H4',
  users:      'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  user:       'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  briefcase:  'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  building:   'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  layers:     'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4',
  logout:     'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  menu:       'M4 6h16M4 12h16M4 18h16',
  x:          'M6 18L18 6M6 6l12 12',
};

const roleBadge = {
  admin:    'bg-red-500/20 text-red-300 ring-red-500/30',
  manager:  'bg-amber-500/20 text-amber-300 ring-amber-500/30',
  employee: 'bg-emerald-500/20 text-emerald-300 ring-emerald-500/30',
};

const NavItem = ({ to, icon, label, end = false, onClick }) => (
  <NavLink
    to={to}
    end={end}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
       ${isActive
         ? 'bg-indigo-500/20 text-white shadow-sm ring-1 ring-indigo-500/30'
         : 'text-slate-400 hover:text-white hover:bg-white/5'
       }`
    }
  >
    <Ic d={ICONS[icon]} className="w-4.5 h-4.5 shrink-0" />
    <span>{label}</span>
  </NavLink>
);

const Divider = ({ label }) => (
  <div className="px-3 pt-5 pb-1">
    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">{label}</p>
  </div>
);

const SidebarContent = ({ user, onLogout, onNav }) => {
  const isAdmin    = user?.role === 'admin';
  const isManager  = user?.role === 'manager';
  const isEmployee = user?.role === 'employee';

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">HR System</p>
            <p className="text-[10px] text-slate-500 leading-tight">Management Portal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <NavItem to="/dashboard" icon="home" label="Dashboard" end onClick={onNav} />

        {isEmployee && (
          <>
            <Divider label="Leaves" />
            <NavItem to="/leaves" icon="calendar" label="My Leaves" onClick={onNav} />
            <NavItem to="/leaves/request" icon="plus" label="Request Leave" onClick={onNav} />
          </>
        )}

        {(isAdmin || isManager) && (
          <>
            <Divider label="Leaves" />
            <NavItem to="/leaves" icon="calendar" label="All Leaves" onClick={onNav} />
          </>
        )}

        {(isAdmin || isManager) && (
          <>
            <Divider label="Recruitment" />
            <NavItem to="/recruitment" icon="briefcase" label="Candidates" onClick={onNav} />
          </>
        )}

        {isAdmin && (
          <>
            <Divider label="Organization" />
            <NavItem to="/departments" icon="building" label="Departments" onClick={onNav} />
            <NavItem to="/positions" icon="layers" label="Positions" onClick={onNav} />
          </>
        )}

        <Divider label="Account" />
        <NavItem to="/profile" icon="user" label="My Profile" onClick={onNav} />
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-bold uppercase shrink-0">
            {user?.name?.[0] ?? user?.id?.[0] ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name ?? 'User'}</p>
            <span className={`inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded-full ring-1 capitalize ${roleBadge[user?.role] ?? 'bg-slate-500/20 text-slate-400 ring-slate-500/30'}`}>
              {user?.role}
            </span>
          </div>
          <button
            onClick={onLogout}
            title="Logout"
            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
          >
            <Ic d={ICONS.logout} className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-60 bg-slate-900 flex flex-col
          transform transition-transform duration-200 ease-in-out lg:transform-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <SidebarContent
          user={user}
          onLogout={handleLogout}
          onNav={() => setSidebarOpen(false)}
        />
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3.5 flex items-center gap-4 shrink-0 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Ic d={ICONS.menu} className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-semibold text-gray-700">{user?.name ?? 'User'}</p>
              <p className="text-[10px] text-gray-400 capitalize">{user?.role}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold uppercase">
              {user?.name?.[0] ?? 'U'}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
