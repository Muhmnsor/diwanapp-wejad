import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
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
      <Toaster />
    </Router>
  );
}

export default App;