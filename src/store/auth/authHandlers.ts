import { supabase } from '@/integrations/supabase/client';
import { AuthApiError } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { User } from './types';

export const handleLogin = async (
  email: string,
  password: string,
  setAuthState: (user: User | null, isAuthenticated: boolean) => void
) => {
  try {
    console.log("AuthStore: Starting login process");
    
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    console.log("AuthStore: Sign in response:", { authData, signInError });

    if (signInError) {
      console.error("AuthStore: Sign in error:", signInError);
      throw signInError;
    }

    if (!authData.user) {
      console.log("AuthStore: No user found after login");
      throw new Error('No user data available');
    }

    // Set initial user state
    const initialUserState: User = {
      id: authData.user.id,
      email: authData.user.email ?? '',
      isAdmin: false
    };

    console.log("AuthStore: Setting initial user state:", initialUserState);

    // First set the basic user info
    setAuthState(initialUserState, true);

    // Check for admin role
    const { data: roleIds, error: roleIdsError } = await supabase
      .from('user_roles')
      .select('role_id')
      .eq('user_id', authData.user.id)
      .single();

    if (roleIdsError) {
      console.error("AuthStore: Error fetching role IDs:", roleIdsError);
      return;
    }

    if (!roleIds) {
      console.log("AuthStore: No roles found for user");
      return;
    }

    // Get role names
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('name')
      .eq('id', roleIds.role_id)
      .single();

    if (rolesError) {
      console.error("AuthStore: Error fetching role names:", rolesError);
      return;
    }

    // Check if user has admin role
    const isAdmin = roles?.name === 'admin';
    
    if (isAdmin) {
      console.log("AuthStore: User is admin, updating state");
      setAuthState({ ...initialUserState, isAdmin: true }, true);
    }

  } catch (error) {
    console.error('AuthStore: Login error:', error);
    if (error instanceof AuthApiError) {
      if (error.message.includes('Invalid login credentials')) {
        toast.error('بيانات الدخول غير صحيحة');
      } else {
        toast.error(error.message);
      }
    }
    throw error;
  }
};

export const handleLogout = async () => {
  try {
    await supabase.auth.signOut();
    toast.success('تم تسجيل الخروج بنجاح');
  } catch (error) {
    console.error('AuthStore: Logout error:', error);
    toast.error('حدث خطأ أثناء تسجيل الخروج');
  }
};