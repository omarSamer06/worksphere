const Loader = ({ text = 'Loading…', fullPage = false }) => {
  if (fullPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner text={text} />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center py-16">
      <Spinner text={text} />
    </div>
  );
};

const Spinner = ({ text }) => (
  <div className="flex flex-col items-center gap-3 text-gray-400">
    <svg className="animate-spin w-7 h-7 text-indigo-500" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
    <span className="text-sm font-medium">{text}</span>
  </div>
);

export default Loader;
