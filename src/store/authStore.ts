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
      // Clear any previous session first
      await supabase.auth.signOut();
      
      // Attempt login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        if (error.message.includes('Invalid login credentials') || 
            error.message.includes('invalid_credentials')) {
          toast.error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
          return;
        }
        
        if (error.message.includes('Email not confirmed')) {
          toast.error('يرجى تأكيد بريدك الإلكتروني أولاً');
          return;
        }

        toast.error('حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى');
        return;
      }

      if (!data.user) {
        toast.error('لم يتم العثور على بيانات المستخدم');
        return;
      }

      // Set initial user state
      const initialUserState: User = {
        id: data.user.id,
        email: data.user.email ?? '',
        isAdmin: false
      };

      set({
        user: initialUserState,
        isAuthenticated: true
      });

      // Check for admin role
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

      toast.success('تم تسجيل الدخول بنجاح');

    } catch (error) {
      toast.error('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى');
    }
  },
  logout: async () => {
    try {
      await supabase.auth.signOut();
      set({ user: null, isAuthenticated: false });
      toast.success('تم تسجيل الخروج بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء تسجيل الخروج');
    }
  }
}));