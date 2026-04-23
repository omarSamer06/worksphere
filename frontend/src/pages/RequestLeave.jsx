import { useState } from 'react';
import LeaveForm from '../components/LeaveForm';
import LeaveCard from '../components/LeaveCard';

const RequestLeave = ({ onLeaveSubmit, remainingLeave }) => {
  const [submitted, setSubmitted] = useState([]);

  const handleSuccess = (leave) => {
    setSubmitted((prev) => [leave, ...prev]);
    onLeaveSubmit?.();
  };

  return (
    <div className="max-w-xl">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Request Leave</h2>
      <div className="bg-gray-50 rounded-xl border border-gray-100 p-6 mb-6">
        <LeaveForm onSuccess={handleSuccess} remainingLeave={remainingLeave} />
      </div>

      {submitted.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3">
            Submitted this session
            <span className="ml-2 bg-indigo-100 text-indigo-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {submitted.length}
            </span>
          </h3>
          <div className="flex flex-col gap-3">
            {submitted.map((leave) => (
              <LeaveCard key={leave._id} leave={leave} showActions={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestLeave;
