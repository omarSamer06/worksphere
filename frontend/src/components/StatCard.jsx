import { Link } from 'react-router-dom';

const PATHS = {
  calendar:  'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  clock:     'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  check:     'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  users:     'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  building:  'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  briefcase: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  alert:     'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  trend:     'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  arrow:     'M13 7l5 5m0 0l-5 5m5-5H6',
};

/* ── default (light) color map ── */
const LIGHT = {
  indigo: { bg: 'bg-white', border: 'border-indigo-100 hover:border-indigo-300 hover:shadow-indigo-100/50', icon: 'bg-indigo-100 text-indigo-600', val: 'text-indigo-700', label: 'text-gray-400' },
  amber:  { bg: 'bg-white', border: 'border-amber-100  hover:border-amber-300  hover:shadow-amber-100/50',  icon: 'bg-amber-100  text-amber-600',  val: 'text-amber-700',  label: 'text-gray-400' },
  green:  { bg: 'bg-white', border: 'border-emerald-100 hover:border-emerald-300 hover:shadow-emerald-100/50', icon: 'bg-emerald-100 text-emerald-600', val: 'text-emerald-700', label: 'text-gray-400' },
  red:    { bg: 'bg-white', border: 'border-red-100    hover:border-red-300    hover:shadow-red-100/50',    icon: 'bg-red-100    text-red-600',    val: 'text-red-700',    label: 'text-gray-400' },
  blue:   { bg: 'bg-white', border: 'border-blue-100   hover:border-blue-300   hover:shadow-blue-100/50',   icon: 'bg-blue-100   text-blue-600',   val: 'text-blue-700',   label: 'text-gray-400' },
  purple: { bg: 'bg-white', border: 'border-purple-100 hover:border-purple-300 hover:shadow-purple-100/50', icon: 'bg-purple-100 text-purple-600', val: 'text-purple-700', label: 'text-gray-400' },
  slate:  { bg: 'bg-white', border: 'border-slate-100  hover:border-slate-300  hover:shadow-slate-100/50',  icon: 'bg-slate-100  text-slate-600',  val: 'text-slate-700',  label: 'text-gray-400' },
};

const StatCard = ({ label, value, icon, color = 'indigo', loading = false, to, variant = 'default' }) => {
  const c   = LIGHT[color] ?? LIGHT.indigo;
  const path = typeof icon === 'string' ? PATHS[icon] : null;

  const inner = (
    <div className={`${c.bg} ${c.border} rounded-2xl border shadow-sm p-5 flex items-center gap-4
      transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md group
      ${to ? 'cursor-pointer' : ''}`}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 ${c.icon}`}>
        {path
          ? <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={path} /></svg>
          : icon
        }
      </div>

      <div className="min-w-0 flex-1">
        <p className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${c.label}`}>{label}</p>
        {loading
          ? <div className="h-7 w-12 bg-gray-100 rounded animate-pulse" />
          : <p className={`text-2xl font-bold leading-tight ${c.val}`}>{value ?? 0}</p>
        }
      </div>

      {to && !loading && (
        <svg className="w-4 h-4 text-gray-200 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d={PATHS.arrow} />
        </svg>
      )}
    </div>
  );

  return to ? <Link to={to} className="block">{inner}</Link> : inner;
};

export default StatCard;
