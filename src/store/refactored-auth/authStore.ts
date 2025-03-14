
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AuthState } from './types';
import { initializeSession, clearSession, checkUserRole, checkAdminRole, getUserRole } from './sessionManager';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  hasInitialized: false,
  
  initialize: async () => {
    // If already initialized, don't reinitialize
    if (get().hasInitialized) {
      return;
    }
    
    try {
      console.log("AuthStore: Starting initialization");
      set({ isLoading: true });
      
      const { user, isAuthenticated } = await initializeSession();
      
      console.log("AuthStore: Initialization complete", { 
        isAuthenticated, 
        userId: user?.id,
        userEmail: user?.email 
      });
      
      set({ 
        user, 
        isAuthenticated, 
        isLoading: false,
        hasInitialized: true 
      });
    } catch (error) {
      console.error("AuthStore: Initialization error:", error);
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        hasInitialized: true 
      });
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

      const isAdmin = await checkAdminRole(authData.user.id);
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
      toast.error('حدث خطأ أثناء تسجيل الخروج');
      
      // Still clear local state even if server logout fails
      set({ 
        user: null, 
        isAuthenticated: false,
        isLoading: false 
      });
      
      throw error;
    }
  },
  
  refreshSession: async () => {
    try {
      console.log("AuthStore: Refreshing session");
      
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data.session) {
        console.log("AuthStore: No valid session found during refresh");
        set({ 
          user: null, 
          isAuthenticated: false 
        });
        return false;
      }
      
      const { user, isAuthenticated } = await initializeSession();
      set({ user, isAuthenticated });
      
      return isAuthenticated;
    } catch (error) {
      console.error("AuthStore: Session refresh error:", error);
      return false;
    }
  }
}));

// Initialize auth state when the store is created, but don't block rendering
const initialize = async () => {
  console.log("AuthStore: Initializing on startup");
  await useAuthStore.getState().initialize();
};

// Start initialization but don't await it
initialize();

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log("Auth state changed:", event, "Session:", session ? "exists" : "null");
  
  if (event === 'SIGNED_OUT') {
    console.log("Auth state: User signed out");
    useAuthStore.setState({ 
      user: null, 
      isAuthenticated: false,
      isLoading: false 
    });
  } else if (event === 'SIGNED_IN' && session) {
    console.log("Auth state: User signed in");
    useAuthStore.getState().initialize();
  } else if (event === 'TOKEN_REFRESHED') {
    console.log("Auth state: Token refreshed");
  } else if (event === 'INITIAL_SESSION') {
    console.log("Auth state: Initial session check");
  }
});
