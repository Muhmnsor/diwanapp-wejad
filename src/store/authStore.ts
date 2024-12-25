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
      
      // First, attempt authentication
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      // Handle authentication errors
      if (authError) {
        console.error('Authentication error details:', authError);
        
        // Map specific error messages
        if (authError.message.includes('Invalid login credentials')) {
          throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        }
        if (authError.message.includes('Email not confirmed')) {
          throw new Error('يرجى تأكيد بريدك الإلكتروني أولاً');
        }
        throw new Error('حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى');
      }

      // Validate user data exists
      if (!authData?.user) {
        console.error('No user data in auth response');
        throw new Error('لم يتم العثور على بيانات المستخدم');
      }

      console.log('Authentication successful, user ID:', authData.user.id);

      try {
        // Fetch user roles in a separate try-catch block
        console.log('Fetching user roles...');
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select(`
            roles (
              name
            )
          `)
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

        // Set user with proper admin status
        set({
          user: {
            id: authData.user.id,
            email: authData.user.email ?? '',
            isAdmin: isAdmin
          },
          isAuthenticated: true
        });

        console.log('Auth store updated successfully');
        toast.success('تم تسجيل الدخول بنجاح');

      } catch (roleError) {
        console.error('Role fetching error:', roleError);
        // Still allow login but without admin privileges if role fetch fails
        set({
          user: {
            id: authData.user.id,
            email: authData.user.email ?? '',
            isAdmin: false
          },
          isAuthenticated: true
        });
        toast.success('تم تسجيل الدخول بنجاح');
      }

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