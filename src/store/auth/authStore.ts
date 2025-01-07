import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { AuthState } from './types';

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

      const initialUserState = {
        id: session.user.id,
        email: session.user.email ?? '',
        isAdmin: false
      };

      set({
        user: initialUserState,
        isAuthenticated: true
      });

      const { data: roleIds } = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('user_id', session.user.id)
        .single();

      if (roleIds) {
        const { data: roles } = await supabase
          .from('roles')
          .select('name')
          .eq('id', roleIds.role_id)
          .single();

        if (roles?.name === 'admin') {
          set(state => ({
            user: {
              ...state.user!,
              isAdmin: true
            }
          }));
        }
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

      const initialUserState = {
        id: authData.user.id,
        email: authData.user.email ?? '',
        isAdmin: false
      };

      set({
        user: initialUserState,
        isAuthenticated: true
      });

      const { data: roleIds } = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('user_id', authData.user.id)
        .single();

      if (roleIds) {
        const { data: roles } = await supabase
          .from('roles')
          .select('name')
          .eq('id', roleIds.role_id)
          .single();

        if (roles?.name === 'admin') {
          set(state => ({
            user: {
              ...state.user!,
              isAdmin: true
            }
          }));
        }
      }

    } catch (error) {
      console.error('AuthStore: Login error:', error);
      throw error;
    }
  },
  logout: async () => {
    try {
      await supabase.auth.signOut();
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

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log("Auth state changed:", event, session);
  
  if (event === 'SIGNED_OUT') {
    useAuthStore.setState({ user: null, isAuthenticated: false });
  } else if (event === 'SIGNED_IN' && session) {
    useAuthStore.getState().initialize();
  }
});