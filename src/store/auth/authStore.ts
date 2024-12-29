import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AuthState } from './types';
import { createUserState, fetchUserRoles } from './authUtils';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  initialize: async () => {
    try {
      console.log("AuthStore: Initializing auth state");
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("AuthStore: Error getting session:", error);
        set({ user: null, isAuthenticated: false });
        return;
      }

      if (!session) {
        console.log("AuthStore: No active session found");
        set({ user: null, isAuthenticated: false });
        return;
      }

      console.log("AuthStore: Active session found, user:", session.user);

      const isAdmin = await fetchUserRoles(session.user.id);
      
      set({
        user: createUserState(session.user.id, session.user.email ?? '', isAdmin),
        isAuthenticated: true
      });

    } catch (error) {
      console.error('AuthStore: Error initializing auth state:', error);
      set({ user: null, isAuthenticated: false });
    }
  },
  login: async (email: string, password: string) => {
    try {
      console.log("AuthStore: Starting login process");
      
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        console.error("AuthStore: Sign in error:", signInError);
        throw signInError;
      }

      if (!authData.user) {
        console.log("AuthStore: No user found after login");
        throw new Error('No user data available');
      }

      const isAdmin = await fetchUserRoles(authData.user.id);
      
      set({
        user: createUserState(authData.user.id, authData.user.email ?? '', isAdmin),
        isAuthenticated: true
      });

    } catch (error) {
      console.error('AuthStore: Login error:', error);
      throw error;
    }
  },
  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      set({ user: null, isAuthenticated: false });
      toast.success('تم تسجيل الخروج بنجاح');
    } catch (error) {
      console.error('AuthStore: Logout error:', error);
      toast.error('حدث خطأ أثناء تسجيل الخروج');
    }
  }
}));

// Initialize auth state when the store is created
useAuthStore.getState().initialize();

// Set up auth state change listener
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log("Auth state changed:", event, session);
  
  if (event === 'SIGNED_OUT') {
    useAuthStore.setState({ user: null, isAuthenticated: false });
  } else if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
    await useAuthStore.getState().initialize();
  }
});