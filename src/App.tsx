import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import './App.css';
import { NotificationProvider } from './contexts/NotificationContext';
import { Toaster } from '@/components/ui/toaster';
import { registerServiceWorker } from './utils/serviceWorkerRegistration';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Register the service worker
    registerServiceWorker();
  }, []);

  return (
    <BrowserRouter>
      <NotificationProvider>
        <AppRoutes />
        <Toaster />
      </NotificationProvider>
    </BrowserRouter>
  );
}

export default App;
