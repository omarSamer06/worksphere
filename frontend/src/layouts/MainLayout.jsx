import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ─────────────── icons ─────────────── */
const Ic = ({ d, className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

const ICONS = {
  home:      'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  calendar:  'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  plus:      'M12 4v16m8-8H4',
  users:     'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  user:      'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  briefcase: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  building:  'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  layers:    'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4',
  clock:     'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  payroll:   'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z',
  logout:    'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  menu:      'M4 6h16M4 12h16M4 18h16',
  x:         'M6 18L18 6M6 6l12 12',
  bell:      'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
};

/* ─────────────── role theme tokens ─────────────── */
const T = {
  admin: {
    sidebarBg:    'bg-white shadow-[inset_-1px_0_0_rgba(0,0,0,0.06)]',
    sidebarBrd:   'border-r border-gray-200',
    logoGrad:     'bg-gradient-to-br from-cyan-400 to-teal-500',
    logoSub:      'text-gray-400',
    navActive:    'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200',
    navHover:     'text-gray-400 hover:text-gray-700 hover:bg-gray-100',
    divTxt:       'text-gray-300',
    footBrd:      'border-t border-gray-100',
    footHover:    'hover:bg-gray-50',
    avatarBg:     'bg-cyan-50 text-cyan-600 ring-1 ring-cyan-200',
    logoutBtn:    'text-gray-400 hover:text-red-500 hover:bg-red-50',
    rolePill:     { admin: 'bg-cyan-50 text-cyan-600 ring-cyan-200', manager: 'bg-amber-50 text-amber-600 ring-amber-200', employee: 'bg-emerald-50 text-emerald-600 ring-emerald-200' },
    userName:     'text-gray-800',
    topBg:        'bg-white/95 border-b border-gray-200/80 backdrop-blur-xl shadow-sm',
    topName:      'text-gray-800',
    topRole:      'text-cyan-600',
    topAvatar:    'bg-cyan-100 text-cyan-600',
    menuBtn:      'text-gray-400 hover:text-gray-700 hover:bg-gray-100',
    mainBg:       'bg-gradient-to-br from-white via-cyan-50/40 to-slate-50',
    contentText:  '',
  },
  manager: {
    footHover:    'hover:bg-purple-500/[0.06]',
    userName:     'text-white',
    sidebarBg:    'bg-gradient-to-b from-[#1d0b3e] via-[#130828] to-[#0d1222]',
    sidebarBrd:   'border-r border-purple-900/20',
    logoGrad:     'bg-gradient-to-br from-purple-500 to-pink-500',
    logoSub:      'text-purple-900/70',
    navActive:    'bg-purple-500/20 text-purple-200 ring-1 ring-purple-500/25 shadow-[0_0_18px_rgba(168,85,247,0.2)]',
    navHover:     'text-purple-500/50 hover:text-purple-200 hover:bg-purple-500/10',
    divTxt:       'text-purple-900/40',
    footBrd:      'border-t border-purple-900/20',
    avatarBg:     'bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/25',
    logoutBtn:    'text-purple-600/70 hover:text-red-400 hover:bg-red-500/10',
    rolePill:     { admin: 'bg-red-500/10 text-red-400 ring-red-500/15', manager: 'bg-purple-500/15 text-purple-300 ring-purple-500/20', employee: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/15' },
    topBg:        'bg-[#1d0b3e]/90 border-b border-purple-900/25 backdrop-blur-xl',
    topName:      'text-purple-100',
    topRole:      'text-purple-400/60',
    topAvatar:    'bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/25',
    menuBtn:      'text-purple-500/50 hover:text-purple-200 hover:bg-purple-500/10',
    mainBg:       'bg-gradient-to-br from-[#0e0520] via-[#080e1c] to-[#0e1525]',
    contentText:  '',
  },
  employee: {
    footHover:    'hover:bg-white/[0.04]',
    userName:     'text-white',
    sidebarBg:    'bg-gradient-to-b from-slate-900 to-slate-950',
    sidebarBrd:   'border-r border-white/[0.04]',
    logoGrad:     'bg-gradient-to-br from-indigo-500 to-violet-500',
    logoSub:      'text-slate-600',
    navActive:    'bg-indigo-500/15 text-white ring-1 ring-indigo-500/25',
    navHover:     'text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]',
    divTxt:       'text-slate-700',
    footBrd:      'border-t border-white/[0.04]',
    avatarBg:     'bg-indigo-500/15 text-indigo-300',
    logoutBtn:    'text-slate-600 hover:text-red-400 hover:bg-red-500/10',
    rolePill:     { admin: 'bg-red-500/20 text-red-300 ring-red-500/30', manager: 'bg-amber-500/20 text-amber-300 ring-amber-500/30', employee: 'bg-emerald-500/20 text-emerald-300 ring-emerald-500/30' },
    topBg:        'bg-white/95 border-b border-gray-200/80 backdrop-blur-xl shadow-sm',
    topName:      'text-gray-800',
    topRole:      'text-gray-400',
    topAvatar:    'bg-indigo-100 text-indigo-600',
    menuBtn:      'text-gray-400 hover:text-gray-700 hover:bg-gray-100',
    mainBg:       'bg-gradient-to-br from-slate-50 via-white to-indigo-50/30',
    contentText:  '',
  },
};

/* ─────────────── nav item ─────────────── */
const NavItem = ({ to, icon, label, end = false, onClick, theme }) => (
  <NavLink
    to={to}
    end={end}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
       ${isActive ? theme.navActive : theme.navHover}`
    }
  >
    {({ isActive }) => (
      <>
        <Ic d={ICONS[icon]} className={`w-4 h-4 shrink-0 transition-all duration-200 ${isActive ? '' : 'opacity-60 group-hover:opacity-100'}`} />
        <span className="truncate">{label}</span>
      </>
    )}
  </NavLink>
);

const Divider = ({ label, theme }) => (
  <div className="px-3 pt-5 pb-1.5">
    <p className={`text-[9px] font-bold uppercase tracking-[0.15em] ${theme.divTxt}`}>{label}</p>
  </div>
);

/* ─────────────── sidebar ─────────────── */
const SidebarContent = ({ user, onLogout, onNav, theme }) => {
  const isAdmin    = user?.role === 'admin';
  const isManager  = user?.role === 'manager';
  const isEmployee = user?.role === 'employee';

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/[0.04]">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${theme.logoGrad}`}>
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div>
            <p className={`text-[13px] font-bold leading-tight tracking-wide ${theme.userName ?? 'text-white'}`}>HR System</p>
            <p className={`text-[10px] leading-tight font-medium ${theme.logoSub}`}>Management Portal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-4 space-y-0.5 overflow-y-auto scrollbar-none">
        <NavItem to="/dashboard" icon="home" label="Dashboard" end onClick={onNav} theme={theme} />

        {isEmployee && (
          <>
            <Divider label="Attendance" theme={theme} />
            <NavItem to="/attendance"     icon="clock"    label="Attendance"    onClick={onNav} theme={theme} />
            <Divider label="Leaves" theme={theme} />
            <NavItem to="/leaves"         icon="calendar" label="My Leaves"     onClick={onNav} theme={theme} />
            <NavItem to="/leaves/request" icon="plus"     label="Request Leave" onClick={onNav} theme={theme} />
            <Divider label="Payroll" theme={theme} />
            <NavItem to="/payroll"        icon="payroll"  label="My Payslips"   onClick={onNav} theme={theme} />
          </>
        )}

        {(isAdmin || isManager) && (
          <>
            <Divider label="Attendance" theme={theme} />
            <NavItem to="/attendance"  icon="clock"    label="Attendance" onClick={onNav} theme={theme} />
            <Divider label="Leaves" theme={theme} />
            <NavItem to="/leaves"      icon="calendar" label="All Leaves" onClick={onNav} theme={theme} />
          </>
        )}

        {(isAdmin || isManager) && (
          <>
            <Divider label="Recruitment" theme={theme} />
            <NavItem to="/recruitment" icon="briefcase" label="Candidates" onClick={onNav} theme={theme} />
          </>
        )}

        {isAdmin && (
          <>
            <Divider label="Payroll" theme={theme} />
            <NavItem to="/payroll"     icon="payroll"  label="Payroll"     onClick={onNav} theme={theme} />
            <Divider label="Organization" theme={theme} />
            <NavItem to="/users"       icon="users"    label="Users"       onClick={onNav} theme={theme} />
            <NavItem to="/departments" icon="building" label="Departments" onClick={onNav} theme={theme} />
            <NavItem to="/positions"   icon="layers"   label="Positions"   onClick={onNav} theme={theme} />
          </>
        )}

        <Divider label="Account" theme={theme} />
        <NavItem to="/profile" icon="user" label="My Profile" onClick={onNav} theme={theme} />
      </nav>

      {/* User footer */}
      <div className={`p-2.5 ${theme.footBrd}`}>
        <div className={`flex items-center gap-3 px-2 py-2.5 rounded-xl transition-all duration-200 group ${theme.footHover ?? 'hover:bg-white/[0.04]'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold uppercase shrink-0 ${theme.avatarBg}`}>
            {user?.name?.[0] ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-semibold truncate leading-tight ${theme.userName ?? 'text-white'}`}>{user?.name ?? 'User'}</p>
            <span className={`inline-flex items-center text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ring-1 mt-0.5 ${theme.rolePill[user?.role] ?? 'bg-slate-500/10 text-slate-400 ring-slate-500/15'}`}>
              {user?.role}
            </span>
          </div>
          <button
            onClick={onLogout}
            title="Logout"
            className={`p-1.5 rounded-lg transition-all duration-200 shrink-0 ${theme.logoutBtn}`}
          >
            <Ic d={ICONS.logout} className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────── main layout ─────────────── */
const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role  = user?.role ?? 'employee';
  const theme = T[role] ?? T.employee;
  const isDark = role === 'manager';

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className={`flex h-screen overflow-hidden ${theme.mainBg}`}>

      {/* ── Mobile backdrop ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-[220px] flex flex-col
          ${theme.sidebarBg} ${theme.sidebarBrd}
          transform transition-transform duration-300 ease-in-out lg:transform-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <SidebarContent user={user} onLogout={handleLogout} onNav={() => setSidebarOpen(false)} theme={theme} />
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Topbar */}
        <header className={`px-4 sm:px-6 py-3 flex items-center gap-3 shrink-0 ${theme.topBg}`}>
          <button
            onClick={() => setSidebarOpen(true)}
            className={`lg:hidden p-2 rounded-xl transition-all duration-200 ${theme.menuBtn}`}
          >
            <Ic d={ICONS.menu} className="w-5 h-5" />
          </button>

          {/* Breadcrumb placeholder / spacer */}
          <div className="flex-1" />

          {/* Right: user info */}
          <div className="flex items-center gap-3">
            {/* Role badge pill */}
            <span className={`hidden sm:inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ring-1 ${theme.rolePill[role] ?? ''}`}>
              {role}
            </span>

            <div className="hidden sm:block text-right">
              <p className={`text-[13px] font-semibold leading-tight ${theme.topName}`}>{user?.name ?? 'User'}</p>
            </div>

            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold uppercase cursor-pointer transition-all duration-200 hover:scale-105 ${theme.topAvatar}`}>
              {user?.name?.[0] ?? 'U'}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className={`max-w-[1280px] mx-auto px-4 sm:px-6 py-7 ${isDark ? '[&_h1]:!text-white' : ''}`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
