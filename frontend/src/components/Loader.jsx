const Loader = ({ text = 'Loading…' }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3">
    <div className="relative w-10 h-10">
      <svg className="animate-spin w-10 h-10 text-indigo-200" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      </svg>
      <svg className="animate-spin w-10 h-10 text-indigo-600 absolute inset-0" fill="none" viewBox="0 0 24 24">
        <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
    </div>
    <p className="text-xs font-medium text-gray-400">{text}</p>
  </div>
);

export default Loader;
