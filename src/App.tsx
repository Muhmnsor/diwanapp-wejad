import { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import AppRoutes from './AppRoutes';
import './App.css';

function App() {
  const { initialize, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

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

  // Listen for auth changes and invalidate queries when auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN') {
        // Invalidate and refetch all queries when user signs in
        await queryClient.invalidateQueries();
      } else if (event === 'SIGNED_OUT') {
        // Clear query cache when user signs out
        queryClient.clear();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;