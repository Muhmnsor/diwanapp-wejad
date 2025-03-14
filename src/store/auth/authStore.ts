
import { create } from 'zustand';
import { supabase } from "@/integrations/supabase/client";
import { AuthState } from './types';
import { initializeSession, clearSession, checkUserRole, getUserRole } from './sessionManager';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  hasInitialized: false,
  
  initialize: async () => {
    try {
      console.log("AuthStore: Initializing session");
      set({ isLoading: true });
      const { user, isAuthenticated } = await initializeSession();
      set({ 
        user, 
        isAuthenticated, 
        isLoading: false, 
        hasInitialized: true 
      });
      console.log("AuthStore: Session initialized", { user, isAuthenticated });
    } catch (error) {
      console.error("AuthStore: Error initializing session", error);
      set({ isLoading: false, hasInitialized: true });
    }
  },

  refreshSession: async () => {
    try {
      console.log("AuthStore: Refreshing session");
      set({ isLoading: true });
      const { user, isAuthenticated } = await initializeSession();
      set({ 
        user, 
        isAuthenticated, 
        isLoading: false 
      });
      console.log("AuthStore: Session refreshed", { user, isAuthenticated });
      return isAuthenticated;
    } catch (error) {
      console.error("AuthStore: Error refreshing session", error);
      set({ isLoading: false });
      return false;
    }
  },

  login: async (email: string, password: string) => {
    try {
      console.log("AuthStore: Starting login process");
      set({ isLoading: true });
      
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) throw signInError;
      if (!authData.user) throw new Error('No user data available');

      const isAdmin = await checkUserRole(authData.user.id);
      const role = await getUserRole(authData.user.id);

      set({
        user: {
          id: authData.user.id,
          email: authData.user.email ?? '',
          isAdmin,
          role: role || undefined
        },
        isAuthenticated: true,
        isLoading: false
      });

    } catch (error) {
      console.error('AuthStore: Login error:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      console.log("AuthStore: Starting logout process");
      set({ isLoading: true });
      await clearSession();
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false 
      });
    } catch (error) {
      console.error('AuthStore: Logout error:', error);
      // Still clear local state even if server logout fails
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false 
      });
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
