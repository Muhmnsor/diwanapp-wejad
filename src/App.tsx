
import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import './App.css';
import { NotificationProvider } from './contexts/NotificationContext';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // محاولة تحميل التطبيق
    try {
      // تم تحميل التطبيق بنجاح
      setIsLoading(false);
    } catch (error) {
      console.error("خطأ في تحميل التطبيق:", error);
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <NotificationProvider>
          <AppRoutes />
          <Toaster />
        </NotificationProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
