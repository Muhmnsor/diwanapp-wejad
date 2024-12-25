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
        console.error('Missing credentials');
        toast.error('البريد الإلكتروني وكلمة المرور مطلوبة');
        throw new Error('البريد الإلكتروني وكلمة المرور مطلوبة');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        console.error('Authentication Error:', error);
        
        if (error.message.includes('Invalid login credentials')) {
          toast.error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
          throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        }
        
        if (error.message.includes('Email not confirmed')) {
          toast.error('يرجى تأكيد بريدك الإلكتروني أولاً');
          throw new Error('يرجى تأكيد بريدك الإلكتروني أولاً');
        }

        toast.error('حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى');
        throw error;
      }

      if (!data.user) {
        toast.error('لم يتم العثور على بيانات المستخدم');
        throw new Error('لم يتم العثور على بيانات المستخدم');
      }

      // Set initial user state
      const initialUserState: User = {
        id: data.user.id,
        email: data.user.email ?? '',
        isAdmin: false
      };

      // Update user state first
      set({
        user: initialUserState,
        isAuthenticated: true
      });

      try {
        // Check for admin role
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('roles (name)')
          .eq('user_id', data.user.id)
          .single();

        if (!rolesError && userRoles?.roles?.name === 'admin') {
          set(state => ({
            user: {
              ...state.user!,
              isAdmin: true
            }
          }));
        }
      } catch (roleError) {
        console.error('Error checking admin role:', roleError);
        // Don't throw here, just log the error since the user is already logged in
      }

      toast.success('تم تسجيل الدخول بنجاح');

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
      toast.success('تم تسجيل الخروج بنجاح');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('حدث خطأ أثناء تسجيل الخروج');
    }
  }
}));