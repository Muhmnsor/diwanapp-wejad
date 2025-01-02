import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import AppRoutes from './AppRoutes';
import './App.css';

// Initialize store outside of component
const initializeAuth = async () => {
  try {
    const { initialize } = useAuthStore.getState();
    await initialize();
  } catch (error) {
    console.error('Failed to initialize auth store:', error);
  }
};

function App() {
  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <Router>
      <AppRoutes />
      <Toaster />
    </Router>
  );
}

export default App;