const PATHS = {
  calendar:  'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  clock:     'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  check:     'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  users:     'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  building:  'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  briefcase: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
};

const COLOR_MAP = {
  indigo: { wrap: 'bg-indigo-50',  icon: 'bg-indigo-100 text-indigo-600',  value: 'text-indigo-700'  },
  amber:  { wrap: 'bg-amber-50',   icon: 'bg-amber-100 text-amber-600',    value: 'text-amber-700'   },
  green:  { wrap: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-600',value: 'text-emerald-700' },
  red:    { wrap: 'bg-red-50',     icon: 'bg-red-100 text-red-600',        value: 'text-red-700'     },
  blue:   { wrap: 'bg-blue-50',    icon: 'bg-blue-100 text-blue-600',      value: 'text-blue-700'    },
  purple: { wrap: 'bg-purple-50',  icon: 'bg-purple-100 text-purple-600',  value: 'text-purple-700'  },
  slate:  { wrap: 'bg-slate-50',   icon: 'bg-slate-100 text-slate-600',    value: 'text-slate-700'   },
};

const StatCard = ({ label, value, icon, color = 'indigo', loading = false }) => {
  const c = COLOR_MAP[color] ?? COLOR_MAP.indigo;
  const path = typeof icon === 'string' ? PATHS[icon] : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${c.icon}`}>
        {path ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={path} />
          </svg>
        ) : icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>
        {loading ? (
          <div className="h-7 w-12 bg-gray-100 rounded animate-pulse" />
        ) : (
          <p className={`text-2xl font-bold leading-tight ${c.value}`}>{value ?? '—'}</p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
