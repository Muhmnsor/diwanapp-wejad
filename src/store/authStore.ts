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
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        console.error('Authentication error:', error);
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        }
        throw new Error('حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى');
      }

      if (!data?.user) {
        console.error('No user data received');
        throw new Error('لم يتم العثور على بيانات المستخدم');
      }

      // Set basic user data first
      set({
        user: {
          id: data.user.id,
          email: data.user.email ?? '',
          isAdmin: false // Default to non-admin
        },
        isAuthenticated: true
      });

      // Then fetch roles separately
      try {
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('roles (name)')
          .eq('user_id', data.user.id)
          .single();

        if (userRoles?.roles?.name === 'admin') {
          set(state => ({
            user: {
              ...state.user!,
              isAdmin: true
            }
          }));
        }
      } catch (rolesError) {
        console.warn('Error fetching roles:', rolesError);
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