import { useEffect } from 'react';
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

    // Wrap initialization in a small timeout to ensure React is fully initialized
    setTimeout(() => {
      initAuth();
    }, 0);
  }, [initialize]);

  return <AppRoutes />;
}

export default App;