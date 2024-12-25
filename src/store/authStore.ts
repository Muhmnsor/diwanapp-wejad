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
      
      // Trim inputs to prevent whitespace issues
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();
      
      console.log('Attempting login with email:', trimmedEmail);
      
      // First check if user exists
      const { data: { user: existingUser }, error: userError } = await supabase.auth.getUser();
      
      if (existingUser) {
        console.log('User already logged in, signing out first');
        await supabase.auth.signOut();
      }

      // Attempt sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      if (error) {
        console.error('Authentication error:', error);
        
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        }
        
        throw new Error('حدث خطأ أثناء تسجيل الدخول');
      }

      if (!data?.user) {
        console.error('No user data in response');
        throw new Error('لم يتم العثور على بيانات المستخدم');
      }

      console.log('Successfully signed in, fetching user roles');

      // Get user roles
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
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
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