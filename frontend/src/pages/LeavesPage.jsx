import { useAuth } from '../context/AuthContext';
import MyLeaves  from './MyLeaves';
import AllLeaves from './AllLeaves';

const LeavesPage = () => {
  const { user } = useAuth();
  return user?.role === 'employee' ? <MyLeaves /> : <AllLeaves />;
};

export default LeavesPage;
