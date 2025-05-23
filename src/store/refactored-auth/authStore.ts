
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AuthState } from './types';
import { initializeSession, clearSession, checkUserRole, checkAdminRole, getUserRole } from './sessionManager';

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

      const isAdmin = await checkAdminRole(authData.user.id);
      const role = await getUserRole(authData.user.id);

      set({
        user: {
          id: authData.user.id,
          email: authData.user.email ?? '',
          isAdmin,
          role: role || undefined
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
      toast.error('حدث خطأ أثناء تسجيل الخروج');
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
