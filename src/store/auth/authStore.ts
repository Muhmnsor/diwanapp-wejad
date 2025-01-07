import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { AuthState } from './types';
import { initializeAuth } from './authInitializer';
import { handleLogin, handleLogout } from './authHandlers';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  initialize: async () => {
    await initializeAuth((user, isAuthenticated) => set({ user, isAuthenticated }));
  },
  login: async (email: string, password: string) => {
    await handleLogin(email, password, (user, isAuthenticated) => set({ user, isAuthenticated }));
  },
  logout: async () => {
    await handleLogout();
    set({ user: null, isAuthenticated: false });
  }
}));

// Initialize auth state when the store is created
useAuthStore.getState().initialize();

// Listen for auth changes
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log("Auth state changed:", event, session);
  
  if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
    useAuthStore.setState({ user: null, isAuthenticated: false });
  } else if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session) {
    await useAuthStore.getState().initialize();
  }
});

export default useAuthStore;