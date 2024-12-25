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
      console.log('Starting login process with email:', email);
      
      if (!email || !password) {
        throw new Error('البريد الإلكتروني وكلمة المرور مطلوبة');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        console.error('Authentication error:', error);
        
        // Map Supabase error messages to Arabic
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        }
        throw new Error('حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى');
      }

      if (!data?.user) {
        console.error('No user data received');
        throw new Error('لم يتم العثور على بيانات المستخدم');
      }

      // Set initial user state
      const initialUserState = {
        id: data.user.id,
        email: data.user.email ?? '',
        isAdmin: false
      };

      set({
        user: initialUserState,
        isAuthenticated: true
      });

      // Fetch user roles in a separate try-catch block
      try {
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('roles (name)')
          .eq('user_id', data.user.id)
          .single();

        if (rolesError) {
          console.warn('Error fetching roles:', rolesError);
          return; // Continue as non-admin
        }

        if (userRoles?.roles?.name === 'admin') {
          set(state => ({
            user: {
              ...state.user!,
              isAdmin: true
            }
          }));
        }
      } catch (rolesError) {
        console.warn('Error in roles fetch:', rolesError);
        // Continue as non-admin user
      }

      toast.success('تم تسجيل الدخول بنجاح');

    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء تسجيل الدخول';
      toast.error(errorMessage);
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
      console.error('Logout error:', error);
      toast.error('حدث خطأ أثناء تسجيل الخروج');
    }
  }
}));