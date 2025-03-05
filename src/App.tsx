
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import './App.css';
import { NotificationProvider } from './contexts/NotificationContext';
import { Toaster } from '@/components/ui/toaster';

function App() {
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
