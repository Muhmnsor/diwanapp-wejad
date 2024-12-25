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
      console.log('Starting login process');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        console.error('Supabase auth error:', error);
        throw new Error('تأكد من صحة البريد الإلكتروني وكلمة المرور');
      }

      if (!data?.user) {
        console.error('No user data received');
        throw new Error('لم يتم العثور على بيانات المستخدم');
      }

      console.log('Successfully signed in, fetching user roles');

      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          roles (
            name
          )
        `)
        .eq('user_id', data.user.id)
        .single();

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
        throw new Error('حدث خطأ أثناء جلب صلاحيات المستخدم');
      }

      const isAdmin = userRoles?.roles?.name === 'admin';
      console.log('User roles fetched, isAdmin:', isAdmin);

      set({
        user: {
          id: data.user.id,
          email: data.user.email ?? '',
          isAdmin: isAdmin
        },
        isAuthenticated: true
      });

      console.log('Auth store updated successfully');
      toast.success('تم تسجيل الدخول بنجاح');
    } catch (error) {
      console.error('Login process failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء تسجيل الدخول';
      toast.error(errorMessage);
      throw error;
    }
  },
  logout: async () => {
    try {
      console.log('Starting logout process');
      await supabase.auth.signOut();
      set({ user: null, isAuthenticated: false });
      toast.success("تم تسجيل الخروج بنجاح");
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("حدث خطأ أثناء تسجيل الخروج");
      throw error;
    }
  }
}));