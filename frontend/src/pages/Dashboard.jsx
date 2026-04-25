import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

/* ─────────────── icon helper ─────────────── */
const Ic = ({ d, className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

const PATHS = {
  calendar:  'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  clock:     'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  check:     'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  users:     'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  building:  'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  briefcase: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  arrow:     'M13 7l5 5m0 0l-5 5m5-5H6',
  alert:     'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  payroll:   'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z',
  plus:      'M12 4v16m8-8H4',
  pulse:     'M3 12h3l3-9 3 18 3-9 3 6h3',
};

/* ─────────────── data hooks ─────────────── */
const useStats = () => {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const refetch = useCallback(() => {
    setLoading(true);
    api.get('/dashboard/stats')
      .then(({ data }) => setStats(data.data))
      .catch(() => setStats({}))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { refetch(); }, [refetch]);
  return { stats: stats ?? {}, loading };
};

const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get('/users/me')
      .then(({ data }) => setProfile(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  return { profile, loading };
};

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const todayStr = () =>
  new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

/* ─────────────────────────────────────────────────────────
   SHARED PRIMITIVES — used across all three dashboards
───────────────────────────────────────────────────────── */

/* Skeleton pulse */
const Skel = ({ className = 'h-8 w-14' }) => (
  <div className={`rounded-lg animate-pulse ${className}`} />
);

/* ────────────────────────────────────────────────────────
   ADMIN — clean, powerful, deep-blue/cyan
──────────────────────────────────────────────────────── */

/* Admin stat card — light cyan theme */
const AdminStat = ({ label, value, accent = 'cyan', to, loading }) => {
  const accentMap = {
    cyan:    { bar: 'bg-cyan-400',    val: 'text-cyan-600'    },
    teal:    { bar: 'bg-teal-400',    val: 'text-teal-600'    },
    amber:   { bar: 'bg-amber-400',   val: 'text-amber-600'   },
    emerald: { bar: 'bg-emerald-400', val: 'text-emerald-600' },
    red:     { bar: 'bg-red-400',     val: 'text-red-600'     },
    violet:  { bar: 'bg-violet-400',  val: 'text-violet-600'  },
  };
  const a = accentMap[accent] ?? accentMap.cyan;

  const card = (
    <div className="relative flex flex-col gap-3 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm
      transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-md
      group overflow-hidden cursor-pointer">
      <div className={`absolute top-0 left-0 right-0 h-[2px] ${a.bar} opacity-60 group-hover:opacity-100 transition-opacity duration-300`} />
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mt-1">{label}</p>
      {loading
        ? <Skel className="h-8 w-16 bg-gray-100" />
        : <p className={`text-3xl font-bold tracking-tight ${a.val}`}>{value ?? 0}</p>
      }
    </div>
  );
  return to ? <Link to={to} className="block">{card}</Link> : card;
};

/* Quick access link card */
const AdminLink = ({ to, label, sub, accent = 'cyan' }) => {
  const hover = {
    cyan:    'hover:border-cyan-200 hover:bg-cyan-50',
    teal:    'hover:border-teal-200 hover:bg-teal-50',
    amber:   'hover:border-amber-200 hover:bg-amber-50',
    emerald: 'hover:border-emerald-200 hover:bg-emerald-50',
    violet:  'hover:border-violet-200 hover:bg-violet-50',
  };
  const sub_color = { cyan: 'text-cyan-500', teal: 'text-teal-500', amber: 'text-amber-500', emerald: 'text-emerald-500', violet: 'text-violet-500' };

  return (
    <Link to={to}
      className={`group flex items-center justify-between gap-3 px-5 py-4 rounded-2xl bg-white border border-gray-100 shadow-sm
        transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${hover[accent]}`}>
      <div>
        <p className="text-sm font-semibold text-gray-700 leading-tight">{label}</p>
        <p className={`text-xs mt-0.5 font-medium ${sub_color[accent]}`}>{sub}</p>
      </div>
      <Ic d={PATHS.arrow} className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-all duration-200 group-hover:translate-x-0.5 shrink-0" />
    </Link>
  );
};

const AdminDashboard = ({ user, stats, loading }) => {
  const name    = user?.name?.split(' ')[0] ?? 'Admin';
  const pending = stats.pendingLeaves ?? 0;

  return (
    <div className="-mx-4 sm:-mx-6 -mt-7 px-4 sm:px-6 pt-8 min-h-screen bg-gradient-to-br from-white via-cyan-50/40 to-slate-50">
      <div className="relative max-w-[1200px] mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-500 mb-2">Control Center</p>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {greeting()}, {name}
            </h1>
            <p className="text-gray-400 text-sm mt-1">{todayStr()}</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 shrink-0 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">All Systems Normal</span>
          </div>
        </div>

        {/* Primary stats — 3 large */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <AdminStat label="Total Employees"  value={stats.totalEmployees}  accent="cyan"    to="/users"       loading={loading} />
          <AdminStat label="Departments"      value={stats.totalDepts}      accent="blue"    to="/departments" loading={loading} />
          <AdminStat label="Open Candidates"  value={stats.openCandidates}  accent="violet"  to="/recruitment" loading={loading} />
        </div>

        {/* Secondary stats — 4 smaller */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <AdminStat label="Pending Leaves"   value={stats.pendingLeaves}       accent="amber"   to="/leaves"     loading={loading} />
          <AdminStat label="Approved Leaves"  value={stats.approvedLeaves}      accent="emerald" to="/leaves"     loading={loading} />
          <AdminStat label="Clocked In Today" value={stats.todayAttendanceCount}accent="cyan"    to="/attendance" loading={loading} />
          <AdminStat label="Late Today"       value={stats.lateToday}           accent="red"     to="/attendance" loading={loading} />
        </div>

        {/* Pending alert */}
        {!loading && pending > 0 && (
          <div className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Ic d={PATHS.alert} className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-900">
                {pending} pending leave approval{pending !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-amber-600/70 mt-0.5">Action required to unblock your team</p>
            </div>
            <Link to="/leaves"
              className="shrink-0 px-4 py-2 text-xs font-bold text-amber-700 border border-amber-300 rounded-xl bg-white
                hover:bg-amber-100 transition-all duration-200">
              Review
            </Link>
          </div>
        )}

        {/* Quick access */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-3">Quick Access</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <AdminLink to="/attendance"  label="Attendance"  sub={`${stats.todayAttendanceCount ?? 0} clocked in today`} accent="cyan"    />
            <AdminLink to="/leaves"      label="Leaves"      sub={`${stats.pendingLeaves ?? 0} pending approvals`}       accent="amber"   />
            <AdminLink to="/payroll"     label="Payroll"     sub="Generate monthly payroll"                              accent="emerald" />
            <AdminLink to="/recruitment" label="Recruitment" sub={`${stats.openCandidates ?? 0} in pipeline`}            accent="violet"  />
          </div>
        </div>

      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────
   MANAGER — gradient cards, activity-focused (refined)
──────────────────────────────────────────────────────── */

const GradientCard = ({ label, value, gradient, iconColor, to, loading, badge }) => {
  const inner = (
    <div className={`relative rounded-2xl p-5 overflow-hidden transition-all duration-300
      hover:-translate-y-1 hover:shadow-2xl cursor-pointer group ${gradient}`}>
      {/* decorative circles */}
      <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/8" />
      <div className="absolute -bottom-4 -left-4 w-14 h-14 rounded-full bg-white/5" />

      <div className="relative">
        {badge > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-white/30 text-white text-[9px] font-bold rounded-full">
            {badge}
          </span>
        )}
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50 mb-2">{label}</p>
        {loading
          ? <Skel className="h-8 w-14 bg-white/10" />
          : <p className="text-3xl font-bold text-white tracking-tight">{value ?? 0}</p>
        }
      </div>
    </div>
  );
  return to ? <Link to={to} className="block">{inner}</Link> : inner;
};

const ManagerLink = ({ to, label, sub, cls }) => (
  <Link to={to}
    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-semibold
      transition-all duration-200 hover:-translate-y-0.5 ${cls}`}>
    <Ic d={PATHS.arrow} className="w-3.5 h-3.5 opacity-60" />
    <div>
      <span className="block leading-tight">{label}</span>
      {sub && <span className="block text-[11px] font-normal opacity-60 mt-0.5">{sub}</span>}
    </div>
  </Link>
);

const ManagerDashboard = ({ user, stats, loading }) => {
  const name    = user?.name?.split(' ')[0] ?? 'Manager';
  const pending = stats.pendingLeaves ?? 0;

  return (
    <div className="-mx-4 sm:-mx-6 -mt-7 px-4 sm:px-6 pt-8 min-h-screen
      bg-gradient-to-br from-[#0e0522] via-[#08101e] to-[#0e1828]">

      <div className="relative max-w-[1200px] mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-2 border-b border-purple-900/20">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-500/50 mb-2">Operations</p>
            <h1 className="text-2xl font-bold text-white tracking-tight">{greeting()}, {name}</h1>
            <p className="text-purple-400/40 text-sm mt-1">{todayStr()}</p>
          </div>
          {pending > 0 && (
            <Link to="/leaves"
              className="shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl
                bg-rose-500/15 border border-rose-500/25 hover:bg-rose-500/20 transition-all duration-200">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
              <span className="text-xs font-bold text-rose-300">{pending} pending</span>
            </Link>
          )}
        </div>

        {/* Urgency banner */}
        {!loading && pending > 0 && (
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/15 via-orange-500/10 to-amber-500/8" />
            <div className="absolute inset-0 border border-rose-500/20 rounded-2xl" />
            <div className="relative flex items-center gap-4 px-5 py-4">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0">
                <Ic d={PATHS.alert} className="w-4.5 h-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">
                  {pending} pending leave approval{pending !== 1 ? 's' : ''} need your attention
                </p>
                <p className="text-xs text-white/35 mt-0.5">Your team is waiting — review them to keep things moving</p>
              </div>
              <Link to="/leaves"
                className="shrink-0 px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-bold
                  rounded-xl border border-rose-500/25 transition-all duration-200">
                Review Now
              </Link>
            </div>
          </div>
        )}

        {/* Gradient stat cards — 4 col */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <GradientCard label="Total Leaves"    value={stats.totalLeaves}    gradient="bg-gradient-to-br from-violet-600 to-purple-800"   to="/leaves"      loading={loading} />
          <GradientCard label="Pending"         value={stats.pendingLeaves}  gradient="bg-gradient-to-br from-rose-500 to-pink-700"        to="/leaves"      loading={loading} badge={pending} />
          <GradientCard label="Approved"        value={stats.approvedLeaves} gradient="bg-gradient-to-br from-emerald-500 to-teal-700"     to="/leaves"      loading={loading} />
          <GradientCard label="Candidates"      value={stats.totalCandidates}gradient="bg-gradient-to-br from-blue-500 to-indigo-700"      to="/recruitment" loading={loading} />
        </div>

        {/* Attendance split */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Team Clocked In Today', value: stats.todayAttendanceCount, to: '/attendance', accent: 'text-blue-300', bg: 'border-blue-900/30 hover:border-blue-500/30' },
            { label: 'Late Arrivals',          value: stats.lateToday,           to: '/attendance', accent: (stats.lateToday ?? 0) > 0 ? 'text-amber-300' : 'text-white', bg: 'border-amber-900/20 hover:border-amber-500/30' },
          ].map((c) => (
            <Link key={c.label} to={c.to}
              className={`group flex items-center justify-between gap-4 p-6 rounded-2xl bg-white/[0.04] border
                transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.06] ${c.bg}`}>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30 mb-2">{c.label}</p>
                {loading
                  ? <Skel className="h-10 w-16 bg-white/5" />
                  : <p className={`text-4xl font-bold tracking-tight ${c.accent}`}>{c.value ?? 0}</p>
                }
              </div>
              <Ic d={PATHS.arrow} className="w-5 h-5 text-white/20 group-hover:text-white/40 transition-all duration-200 group-hover:translate-x-0.5 shrink-0" />
            </Link>
          ))}
        </div>

        {/* Quick actions */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-purple-500/30 mb-3">Quick Actions</p>
          <div className="flex flex-wrap gap-2">
            <ManagerLink to="/leaves"      label="Review Leaves"  sub={`${pending} pending`}  cls="bg-purple-500/10 text-purple-200 border-purple-500/20 hover:bg-purple-500/15 hover:border-purple-400/30" />
            <ManagerLink to="/attendance"  label="Attendance"     sub="View team"              cls="bg-blue-500/10 text-blue-200 border-blue-500/20 hover:bg-blue-500/15 hover:border-blue-400/30" />
            <ManagerLink to="/recruitment" label="Recruitment"    sub="Open positions"         cls="bg-indigo-500/10 text-indigo-200 border-indigo-500/20 hover:bg-indigo-500/15 hover:border-indigo-400/30" />
            <ManagerLink to="/profile"     label="My Profile"     sub={null}                   cls="bg-white/5 text-white/60 border-white/10 hover:bg-white/8 hover:border-white/15" />
          </div>
        </div>

      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────
   EMPLOYEE — clean, friendly, modern (elevated from basic)
──────────────────────────────────────────────────────── */

const EmpStat = ({ label, value, to, loading, gradient, valCls }) => {
  const inner = (
    <div className={`rounded-2xl p-5 border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer group ${gradient}`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50 mb-3">{label}</p>
      {loading
        ? <Skel className="h-8 w-12 bg-white/10" />
        : <p className={`text-3xl font-bold tracking-tight ${valCls}`}>{value ?? 0}</p>
      }
    </div>
  );
  return to ? <Link to={to} className="block">{inner}</Link> : inner;
};

const EmpAction = ({ to, icon, label, description, color }) => {
  const map = {
    indigo: { ring: 'hover:border-indigo-200 hover:shadow-indigo-50', icon: 'bg-indigo-100 text-indigo-600' },
    emerald:{ ring: 'hover:border-emerald-200 hover:shadow-emerald-50', icon: 'bg-emerald-100 text-emerald-600' },
    amber:  { ring: 'hover:border-amber-200 hover:shadow-amber-50', icon: 'bg-amber-100 text-amber-600' },
    violet: { ring: 'hover:border-violet-200 hover:shadow-violet-50', icon: 'bg-violet-100 text-violet-600' },
  };
  const c = map[color] ?? map.indigo;
  return (
    <Link to={to}
      className={`group flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm
        transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${c.ring}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 ${c.icon}`}>
        <Ic d={PATHS[icon]} className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 leading-tight">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5 truncate">{description}</p>
      </div>
      <Ic d={PATHS.arrow} className="w-4 h-4 text-gray-300 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
    </Link>
  );
};

const EmployeeDashboard = ({ user, stats, loading, profile }) => {
  const name        = user?.name?.split(' ')[0] ?? '';
  const total       = profile?.totalLeave ?? 20;
  const used        = profile?.usedLeave  ?? 0;
  const remaining   = Math.max(0, total - used);
  const pct         = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  const barColor    = pct >= 90 ? 'bg-red-400' : pct >= 60 ? 'bg-amber-400' : 'bg-emerald-400';

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {greeting()}{name ? `, ${name}` : ''} 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">{todayStr()}</p>
        </div>
        {profile?.department && (
          <div className="shrink-0 flex items-center gap-3 px-4 py-2.5 rounded-2xl
            bg-indigo-50 border border-indigo-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Ic d={PATHS.building} className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-800 leading-tight">{profile.department?.name}</p>
              {profile.position && <p className="text-[11px] text-indigo-400/80">{profile.position?.title}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Leave balance card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between border-b border-gray-50">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-1">Leave Balance</p>
            <p className="text-sm text-gray-500">{used} of {total} days used</p>
          </div>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
            pct >= 90 ? 'bg-red-50 text-red-600' : pct >= 60 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
          }`}>
            {remaining} days left
          </span>
        </div>
        <div className="px-6 py-5">
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { l: 'Total',    v: total,    c: 'text-gray-800' },
              { l: 'Used',     v: used,     c: 'text-amber-600' },
              { l: 'Remaining',v: remaining,c: 'text-emerald-600' },
            ].map((s) => (
              <div key={s.l} className="text-center py-3 bg-gray-50 rounded-xl">
                <p className={`text-2xl font-bold ${s.c}`}>{s.v}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* Leave request stats — gradient cards matching manager style */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <EmpStat label="Total Requests" value={stats.totalLeaves}    gradient="bg-gradient-to-br from-indigo-500 to-violet-600 border-transparent"  valCls="text-white" to="/leaves"  loading={loading} />
        <EmpStat label="Pending"        value={stats.pendingLeaves}  gradient="bg-gradient-to-br from-amber-400 to-orange-500 border-transparent"    valCls="text-white" to="/leaves"  loading={loading} />
        <EmpStat label="Approved"       value={stats.approvedLeaves} gradient="bg-gradient-to-br from-emerald-500 to-teal-600 border-transparent"    valCls="text-white" to="/leaves"  loading={loading} />
      </div>

      {/* Quick actions */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-4">Quick Actions</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <EmpAction to="/attendance"     icon="clock"    label="Attendance"    description="Clock in / clock out"       color="indigo"  />
          <EmpAction to="/leaves/request" icon="plus"     label="Request Leave" description="Submit a new leave request" color="emerald" />
          <EmpAction to="/leaves"         icon="calendar" label="My Leaves"
            description={stats.pendingLeaves ? `${stats.pendingLeaves} pending` : 'View history'} color="amber" />
          <EmpAction to="/payroll"        icon="payroll"  label="Payslips"      description="View salary statements"     color="violet"  />
        </div>
      </div>

    </div>
  );
};

/* ────────────────────────────────────────────────────────
   ROOT
──────────────────────────────────────────────────────── */
const Dashboard = () => {
  const { user }                    = useAuth();
  const { stats, loading }          = useStats();
  const { profile }                 = useProfile();
  const role                        = user?.role ?? 'employee';

  if (role === 'admin')   return <AdminDashboard   user={user} stats={stats} loading={loading} />;
  if (role === 'manager') return <ManagerDashboard user={user} stats={stats} loading={loading} />;
  return <EmployeeDashboard user={user} stats={stats} loading={loading} profile={profile} />;
};

export default Dashboard;
