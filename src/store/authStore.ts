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

      // First, verify if the user exists in Supabase
      const { data: { user }, error: userError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (userError) {
        console.error('Authentication Error:', userError);
        
        // More specific error handling
        switch (userError.message) {
          case 'Invalid login credentials':
            toast.error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
            throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
          case 'Email not confirmed':
            toast.error('يرجى تأكيد بريدك الإلكتروني أولاً');
            throw new Error('يرجى تأكيد بريدك الإلكتروني أولاً');
          default:
            toast.error('حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى');
            throw new Error('حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى');
        }
      }

      if (!user) {
        toast.error('لم يتم العثور على بيانات المستخدم');
        throw new Error('لم يتم العثور على بيانات المستخدم');
      }

      // Set initial user state
      const initialUserState: User = {
        id: user.id,
        email: user.email ?? '',
        isAdmin: false
      };

      // Update user state first
      set({
        user: initialUserState,
        isAuthenticated: true
      });

      // Check for admin role
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('roles (name)')
        .eq('user_id', user.id)
        .single();

      if (userRoles?.roles?.name === 'admin') {
        set(state => ({
          user: {
            ...state.user!,
            isAdmin: true
          }
        }));
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