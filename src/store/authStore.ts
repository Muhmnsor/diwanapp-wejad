import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

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
      console.log('Attempting to login with:', email);
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        throw signInError;
      }

      if (!signInData.user) {
        throw new Error('No user data returned');
      }

      // Get user roles after successful sign in
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          roles (
            name
          )
        `)
        .eq('user_id', signInData.user.id)
        .single();

      if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
        throw rolesError;
      }

      const isAdmin = userRoles?.roles?.name === 'admin';

      set({
        user: {
          id: signInData.user.id,
          email: signInData.user.email ?? '',
          isAdmin: isAdmin
        },
        isAuthenticated: true
      });

      console.log('Auth store updated with user:', signInData.user.id, 'isAdmin:', isAdmin);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
}));