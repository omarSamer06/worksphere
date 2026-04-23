import { useState } from 'react';
import Candidates from './Candidates';
import AddCandidate from './AddCandidate';

const Recruitment = () => {
  const [view, setView] = useState('list'); // 'list' | 'add'
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAdded = () => {
    setRefreshKey((k) => k + 1);
    setView('list');
  };

  return (
    <div>
      {view === 'add' ? (
        <AddCandidate
          onSuccess={handleAdded}
          onCancel={() => setView('list')}
        />
      ) : (
        <Candidates
          key={refreshKey}
          onAddNew={() => setView('add')}
        />
      )}
    </div>
  );
};

export default Recruitment;
