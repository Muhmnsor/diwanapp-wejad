import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppRoutes from './AppRoutes';
import './App.css';

const queryClient = new QueryClient();

function App() {
  const initialize = useAuthStore(state => state.initialize);

  useEffect(() => {
    // Initialize auth store after component mounts
    initialize();
  }, [initialize]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppRoutes />
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;