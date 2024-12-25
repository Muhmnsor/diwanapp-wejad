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
      
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        if (signInError.message.includes('Invalid login credentials')) {
          throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        }
        throw new Error('حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى');
      }

      if (!authData?.user) {
        console.error('No user data received after successful sign in');
        throw new Error('لم يتم العثور على بيانات المستخدم');
      }

      // After successful authentication, fetch user roles in a separate query
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('roles (name)')
        .eq('user_id', authData.user.id)
        .single();

      const isAdmin = userRoles?.roles?.name === 'admin';
      console.log('User roles fetched, isAdmin:', isAdmin);

      set({
        user: {
          id: authData.user.id,
          email: authData.user.email ?? '',
          isAdmin: isAdmin
        },
        isAuthenticated: true
      });

      if (rolesError) {
        console.warn('Error fetching roles:', rolesError);
        // Don't throw here, just log the warning as the user is already authenticated
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