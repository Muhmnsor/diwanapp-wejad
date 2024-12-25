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
        console.error('Error details:', {
          code: error.message,
          status: error.status,
          name: error.name
        });
        
        // Handle specific error codes
        if (error.message.includes('Invalid login credentials') || error.message.includes('invalid_credentials')) {
          const errorMsg = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
          console.error(errorMsg);
          toast.error(errorMsg);
          throw new Error(errorMsg);
        }
        
        if (error.message.includes('Email not confirmed')) {
          const errorMsg = 'يرجى تأكيد بريدك الإلكتروني أولاً';
          console.error(errorMsg);
          toast.error(errorMsg);
          throw new Error(errorMsg);
        }

        // Generic error
        const errorMsg = 'حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى';
        console.error(errorMsg);
        toast.error(errorMsg);
        throw error;
      }

      if (!data.user) {
        const errorMsg = 'لم يتم العثور على بيانات المستخدم';
        console.error(errorMsg);
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }

      console.log('Login successful, user data:', data.user);

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

        if (rolesError) {
          console.error('Error checking admin role:', rolesError);
        }

        if (userRoles?.roles?.name === 'admin') {
          console.log('User is admin, updating state');
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

      console.log('Login process completed successfully');
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