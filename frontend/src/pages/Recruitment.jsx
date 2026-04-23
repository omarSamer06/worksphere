import { useState } from 'react';
import Candidates from './Candidates';
import AddCandidate from './AddCandidate';

const Recruitment = () => {
  const [view, setView] = useState('list');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAdded = () => {
    setRefreshKey((k) => k + 1);
    setView('list');
  };

  if (view === 'add') {
    return <AddCandidate onSuccess={handleAdded} onCancel={() => setView('list')} />;
  }

  return <Candidates key={refreshKey} onAddNew={() => setView('add')} />;
};

export default Recruitment;
