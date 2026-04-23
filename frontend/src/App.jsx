import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';

import Login        from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import Dashboard    from './pages/Dashboard';
import LeavesPage   from './pages/LeavesPage';
import RequestLeave from './pages/RequestLeave';
import Recruitment  from './pages/Recruitment';
import DepartmentManagement from './pages/DepartmentManagement';
import PositionManagement   from './pages/PositionManagement';
import Profile      from './pages/Profile';

/* Wraps a page in MainLayout inside a ProtectedRoute */
const Protected = ({ children, roles }) => (
  <ProtectedRoute roles={roles}>
    <MainLayout>{children}</MainLayout>
  </ProtectedRoute>
);

const App = () => (
  <AuthProvider>
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/login"        element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Root → dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Protected — any authenticated role */}
        <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="/profile"   element={<Protected><Profile /></Protected>} />

        {/* Leaves — role-aware component handles employee vs admin view */}
        <Route path="/leaves"         element={<Protected><LeavesPage /></Protected>} />
        <Route path="/leaves/request" element={<Protected roles={['employee']}><RequestLeave /></Protected>} />

        {/* Recruitment (admin + manager) */}
        <Route path="/recruitment" element={<Protected roles={['admin', 'manager']}><Recruitment /></Protected>} />

        {/* Admin org structure */}
        <Route path="/departments" element={<Protected roles={['admin']}><DepartmentManagement /></Protected>} />
        <Route path="/positions"   element={<Protected roles={['admin']}><PositionManagement /></Protected>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  </AuthProvider>
);

export default App;
