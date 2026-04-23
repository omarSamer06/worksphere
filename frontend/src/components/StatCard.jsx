const StatCard = ({ label, value, icon, color = 'indigo', loading = false }) => {
  const colorMap = {
    indigo: { bg: 'bg-indigo-50', icon: 'bg-indigo-100 text-indigo-600', value: 'text-indigo-700' },
    amber:  { bg: 'bg-amber-50',  icon: 'bg-amber-100 text-amber-600',   value: 'text-amber-700'  },
    green:  { bg: 'bg-green-50',  icon: 'bg-green-100 text-green-600',   value: 'text-green-700'  },
    red:    { bg: 'bg-red-50',    icon: 'bg-red-100 text-red-600',       value: 'text-red-700'    },
    blue:   { bg: 'bg-blue-50',   icon: 'bg-blue-100 text-blue-600',     value: 'text-blue-700'   },
    purple: { bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-600', value: 'text-purple-700' },
  };

  const c = colorMap[color] ?? colorMap.indigo;

  return (
    <div className={`rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 bg-white`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${c.icon}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
        {loading ? (
          <div className="h-6 w-12 bg-gray-100 rounded animate-pulse" />
        ) : (
          <p className={`text-2xl font-bold ${c.value}`}>{value ?? '—'}</p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
