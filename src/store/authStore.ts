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
      
      // First attempt authentication
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (authError) {
        console.error('Authentication error:', authError);
        
        // Map specific error messages
        if (authError.message.includes('Invalid login credentials')) {
          throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        }
        throw new Error('حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى');
      }

      if (!authData?.user) {
        console.error('No user data received');
        throw new Error('لم يتم العثور على بيانات المستخدم');
      }

      // After successful authentication, fetch user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('roles (name)')
        .eq('user_id', authData.user.id)
        .single();

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
        // Set user without admin privileges if role fetch fails
        set({
          user: {
            id: authData.user.id,
            email: authData.user.email ?? '',
            isAdmin: false
          },
          isAuthenticated: true
        });
        toast.success('تم تسجيل الدخول بنجاح');
        return;
      }

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
      await supabase.auth.signOut();
      set({ user: null, isAuthenticated: false });
      toast.success('تم تسجيل الخروج بنجاح');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('حدث خطأ أثناء تسجيل الخروج');
      throw error;
    }
  }
}));