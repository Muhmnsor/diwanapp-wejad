import { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import AppRoutes from './AppRoutes';
import './App.css';

function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      try {
        await initialize();
      } catch (error) {
        console.error('Failed to initialize auth store:', error);
      }
    };

    initAuth();
  }, [initialize]);

  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;