import { useState } from 'react';
import LeaveForm from '../components/LeaveForm';
import LeaveCard from '../components/LeaveCard';

const RequestLeave = () => {
  const [submitted, setSubmitted] = useState([]);

  const handleSuccess = (leave) => {
    setSubmitted((prev) => [leave, ...prev]);
  };

  return (
    <div className="max-w-xl">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Request Leave</h2>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <LeaveForm onSuccess={handleSuccess} />
      </div>

      {submitted.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3">Submitted this session</h3>
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
