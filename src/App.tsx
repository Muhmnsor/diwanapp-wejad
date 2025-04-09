import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import './App.css';
import { NotificationProvider } from './contexts/NotificationContext';
import { Toaster } from '@/components/ui/toaster';
import { SelfAttendanceToolbar } from './components/hr/self-attendance/SelfAttendanceToolbar';
import { useAuthStore } from '@/store/refactored-auth';
// أضف هذا الإستيراد مع باقي الاستيرادات في أعلى الملف
import DeadlineReminderService from "./components/correspondence/services/DeadlineReminderService";

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <>
      <Toaster />
      <DeadlineReminderService />
      <BrowserRouter>
        <NotificationProvider>
          <AppRoutes />
          {isAuthenticated && <SelfAttendanceToolbar />}
        </NotificationProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
