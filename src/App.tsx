
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import './App.css';
import { NotificationProvider } from './contexts/NotificationContext';
import { Toaster } from '@/components/ui/toaster';
import { SelfAttendanceToolbar } from './components/hr/self-attendance/SelfAttendanceToolbar';
import { useAuthStore } from '@/store/refactored-auth';

function App() {
  const { isAuthenticated } = useAuthStore();
  
  return (
    <BrowserRouter>
      <NotificationProvider>
        <AppRoutes />
        {isAuthenticated && <SelfAttendanceToolbar />}
        <Toaster />
      </NotificationProvider>
    </BrowserRouter>
  );
}

export default App;
