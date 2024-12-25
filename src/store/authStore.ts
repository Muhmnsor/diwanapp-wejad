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
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (email: string, password: string) => {
    try {
      console.log("AuthStore: Starting login process");
      
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      console.log("AuthStore: Sign in response:", { authData, signInError });

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

      // First get role IDs
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

      // Then get role names
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
      console.log("AuthStore: Is user admin?", isAdmin);

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
      await supabase.auth.signOut();
      set({ user: null, isAuthenticated: false });
      toast.success('تم تسجيل الخروج بنجاح');
    } catch (error) {
      console.error('AuthStore: Logout error:', error);
      toast.error('حدث خطأ أثناء تسجيل الخروج');
    }
  }
}));