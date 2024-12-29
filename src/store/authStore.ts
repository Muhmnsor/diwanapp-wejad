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
  logout: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  initialize: async () => {
    try {
      console.log("AuthStore: Initializing auth state");
      
      // Get current session
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

      // Set initial user state
      const initialUserState: User = {
        id: session.user.id,
        email: session.user.email ?? '',
        isAdmin: false
      };

      // First set the basic user info
      set({
        user: initialUserState,
        isAuthenticated: true
      });

      // Check for admin role
      const { data: roleIds, error: roleIdsError } = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('user_id', session.user.id);

      if (roleIdsError) {
        console.error("AuthStore: Error fetching role IDs:", roleIdsError);
        return;
      }

      if (!roleIds?.length) {
        console.log("AuthStore: No roles found for user");
        return;
      }

      // Get role names
      const { data: roles, error: rolesError } = await supabase
        .from('roles')
        .select('name')
        .in('id', roleIds.map(r => r.role_id));

      if (rolesError) {
        console.error("AuthStore: Error fetching role names:", rolesError);
        return;
      }

      // Check if user has admin role
      const isAdmin = roles?.some(role => role.name === 'admin') ?? false;
      
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

      if (signInError) {
        console.error("AuthStore: Sign in error:", signInError);
        throw signInError;
      }

      if (!authData.user) {
        console.log("AuthStore: No user found after login");
        throw new Error('No user data available');
      }

      // Set initial user state
      const initialUserState: User = {
        id: authData.user.id,
        email: authData.user.email ?? '',
        isAdmin: false
      };

      console.log("AuthStore: Setting initial user state:", initialUserState);

      // First set the basic user info
      set({
        user: initialUserState,
        isAuthenticated: true
      });

      // Check for admin role
      const { data: roleIds, error: roleIdsError } = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('user_id', authData.user.id);

      if (roleIdsError) {
        console.error("AuthStore: Error fetching role IDs:", roleIdsError);
        return;
      }

      if (!roleIds?.length) {
        console.log("AuthStore: No roles found for user");
        return;
      }

      // Get role names
      const { data: roles, error: rolesError } = await supabase
        .from('roles')
        .select('name')
        .in('id', roleIds.map(r => r.role_id));

      if (rolesError) {
        console.error("AuthStore: Error fetching role names:", rolesError);
        return;
      }

      // Check if user has admin role
      const isAdmin = roles?.some(role => role.name === 'admin') ?? false;
      
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
  
  if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
    useAuthStore.setState({ user: null, isAuthenticated: false });
  } else if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
    await useAuthStore.getState().initialize();
  }
});