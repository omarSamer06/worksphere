import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { user, token, logout } = useAuth();
  const location = useLocation();

  // Double-check localStorage directly — context state and storage can drift if the
  // token is cleared externally (another tab, manual clear, etc.)
  const storedToken = localStorage.getItem('token');

  if (!token || !user || !storedToken) {
    // Sync context if localStorage was cleared externally
    if (token && !storedToken) logout();
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
