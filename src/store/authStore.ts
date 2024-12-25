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
      
      // Get the session data
      const { data: { user } } = await supabase.auth.getUser();
      console.log("AuthStore: Current user:", user);

      if (!user) {
        console.log("AuthStore: No user found after login");
        throw new Error('No user data available');
      }

      // Set initial user state
      const initialUserState: User = {
        id: user.id,
        email: user.email ?? '',
        isAdmin: false
      };

      console.log("AuthStore: Setting initial user state:", initialUserState);

      set({
        user: initialUserState,
        isAuthenticated: true
      });

      // Check for admin role
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('roles (name)')
        .eq('user_id', user.id)
        .single();

      console.log("AuthStore: User roles response:", { userRoles, rolesError });

      if (userRoles?.roles?.name === 'admin') {
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