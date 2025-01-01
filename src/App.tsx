import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import AppRoutes from './AppRoutes';
import './App.css';

function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Router>
      <AppRoutes />
      <Toaster />
    </Router>
  );
}

export default App;