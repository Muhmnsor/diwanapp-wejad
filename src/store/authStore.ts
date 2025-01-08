import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  isAdmin: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  initialize: async () => {
    try {
      console.log("AuthStore: Initializing auth state");
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("AuthStore: No active session found");
        set({ user: null, isAuthenticated: false });
        return;
      }

      console.log("AuthStore: Active session found, user:", session.user);

      const initialUserState: User = {
        id: session.user.id,
        email: session.user.email ?? '',
        isAdmin: false
      };

      set({
        user: initialUserState,
        isAuthenticated: true
      });

      const { data: roleIds, error: roleIdsError } = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('user_id', session.user.id)
        .single();

      if (roleIdsError) {
        console.error("AuthStore: Error fetching role IDs:", roleIdsError);
        return;
      }

      if (!roleIds) {
        console.log("AuthStore: No roles found for user");
        return;
      }

      const { data: roles, error: rolesError } = await supabase
        .from('roles')
        .select('name')
        .eq('id', roleIds.role_id)
        .single();

      if (rolesError) {
        console.error("AuthStore: Error fetching role names:", rolesError);
        return;
      }

      const isAdmin = roles?.name === 'admin';
      
      if (isAdmin) {
        console.log("AuthStore: User is admin, updating state");
        set(state => ({
          user: {
            ...state.user!,
            isAdmin: true
          }
        }));
      }

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

      if (signInError) throw signInError;

      if (!authData.user) {
        throw new Error('No user data available');
      }

      const initialUserState: User = {
        id: authData.user.id,
        email: authData.user.email ?? '',
        isAdmin: false
      };

      set({
        user: initialUserState,
        isAuthenticated: true
      });

      const { data: roleIds, error: roleIdsError } = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('user_id', authData.user.id)
        .single();

      if (roleIdsError) {
        console.error("AuthStore: Error fetching role IDs:", roleIdsError);
        return;
      }

      if (!roleIds) {
        console.log("AuthStore: No roles found for user");
        return;
      }

      const { data: roles, error: rolesError } = await supabase
        .from('roles')
        .select('name')
        .eq('id', roleIds.role_id)
        .single();

      if (rolesError) {
        console.error("AuthStore: Error fetching role names:", rolesError);
        return;
      }

      const isAdmin = roles?.name === 'admin';
      
      if (isAdmin) {
        set(state => ({
          user: {
            ...state.user!,
            isAdmin: true
          }
        }));
      }

    } catch (error) {
      console.error('AuthStore: Login error:', error);
      throw error;
    }
  },
  logout: async () => {
    try {
      console.log("AuthStore: Starting logout process");
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("AuthStore: Error during logout:", error);
        throw error;
      }

      console.log("AuthStore: Successfully signed out from Supabase");
      
      // Clear auth state
      set({ user: null, isAuthenticated: false });
      
      // Clear any local storage items if needed
      localStorage.removeItem('supabase.auth.token');
      
      console.log("AuthStore: Auth state cleared");
      
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