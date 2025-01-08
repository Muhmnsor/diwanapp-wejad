import { create } from 'zustand';
import { supabase } from "@/integrations/supabase/client";
import { AuthState } from './types';
import { initializeSession, clearSession, checkUserRole } from './sessionManager';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  
  initialize: async () => {
    const { user, isAuthenticated } = await initializeSession();
    set({ user, isAuthenticated });
  },

  login: async (email: string, password: string) => {
    try {
      console.log("AuthStore: Starting login process");
      
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) throw signInError;
      if (!authData.user) throw new Error('No user data available');

      const isAdmin = await checkUserRole(authData.user.id);

      set({
        user: {
          id: authData.user.id,
          email: authData.user.email ?? '',
          isAdmin
        },
        isAuthenticated: true
      });

    } catch (error) {
      console.error('AuthStore: Login error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      console.log("AuthStore: Starting logout process");
      await clearSession();
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('AuthStore: Logout error:', error);
      // Still clear local state even if server logout fails
      set({ user: null, isAuthenticated: false });
      throw error;
    }
  }
}));

// Initialize auth state when the store is created
useAuthStore.getState().initialize();

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log("Auth state changed:", event, session);
  
  if (event === 'SIGNED_OUT') {
    useAuthStore.setState({ user: null, isAuthenticated: false });
  } else if (event === 'SIGNED_IN' && session) {
    useAuthStore.getState().initialize();
  }
});