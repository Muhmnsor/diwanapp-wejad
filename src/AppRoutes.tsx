
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Settings from './pages/Settings';
import Users from './pages/Users';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import AdminRoute from './components/AdminRoute';
import UserProfile from './pages/UserProfile';
import Tasks from './pages/Tasks';
import Projects from './pages/Projects';
import FinanceDashboard from './components/finance/FinanceDashboard';
import FinancialTargets from './components/finance/targets/FinancialTargets';
import FinancialReports from './components/finance/reports/FinancialReports';
import DeveloperSettings from './pages/DeveloperSettings';

export default function AppRoutes() {
  const DeveloperPerformance = React.lazy(() => import('./pages/DeveloperPerformance'));
  
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      <Route path="/users" element={
        <AdminRoute>
          <Users />
        </AdminRoute>
      } />
      <Route path="/profile/:userId" element={
        <ProtectedRoute>
          <UserProfile />
        </ProtectedRoute>
      } />
      <Route path="/tasks" element={
        <ProtectedRoute>
          <Tasks />
        </ProtectedRoute>
      } />
      <Route path="/projects" element={
        <ProtectedRoute>
          <Projects />
        </ProtectedRoute>
      } />
      <Route path="/admin/dashboard" element={
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      } />
      <Route path="/finance/dashboard" element={
        <ProtectedRoute>
          <FinanceDashboard />
        </ProtectedRoute>
      } />
      <Route path="/finance/targets" element={
        <ProtectedRoute>
          <FinancialTargets />
        </ProtectedRoute>
      } />
      <Route path="/finance/reports" element={
        <ProtectedRoute>
          <FinancialReports />
        </ProtectedRoute>
      } />
      
      {/* Developer routes */}
      <Route path="/developer/settings" element={
        <ProtectedRoute>
          <DeveloperSettings />
        </ProtectedRoute>
      } />
      <Route path="/developer/performance" element={
        <ProtectedRoute>
          <React.Suspense fallback={<div>Loading...</div>}>
            <DeveloperPerformance />
          </React.Suspense>
        </ProtectedRoute>
      } />
    </Routes>
  );
}
