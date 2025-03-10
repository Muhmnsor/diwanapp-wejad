
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Users from './pages/Users';
import UsersManagement from './pages/UsersManagement';
import DeveloperSettings from './pages/DeveloperSettings';
import UserSettings from './pages/UserSettings';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
      <Route path="/users-management" element={<ProtectedRoute><UsersManagement /></ProtectedRoute>} />
      <Route path="/developer-settings" element={<ProtectedRoute><DeveloperSettings /></ProtectedRoute>} />
      <Route path="/user-settings" element={<ProtectedRoute><UserSettings /></ProtectedRoute>} />
    </Routes>
  );
}
