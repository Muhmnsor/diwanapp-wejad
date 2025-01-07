import { supabase } from '@/integrations/supabase/client';
import { AuthApiError } from '@supabase/supabase-js';
import { User } from './types';

export const initializeAuth = async (
  setAuthState: (user: User | null, isAuthenticated: boolean) => void
) => {
  try {
    console.log("AuthStore: Initializing auth state");
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("AuthStore: Session error:", sessionError);
      setAuthState(null, false);
      return;
    }
    
    if (!session) {
      console.log("AuthStore: No active session found");
      setAuthState(null, false);
      return;
    }

    console.log("AuthStore: Active session found, user:", session.user);

    // Set initial user state
    const initialUserState: User = {
      id: session.user.id,
      email: session.user.email ?? '',
      isAdmin: false
    };

    // First set the basic user info
    setAuthState(initialUserState, true);

    // Check for admin role
    const { data: roleIds, error: roleIdsError } = await supabase
      .from('user_roles')
      .select('role_id')
      .eq('user_id', session.user.id)
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
    console.error('AuthStore: Error initializing auth state:', error);
    if (error instanceof AuthApiError && error.message.includes('refresh_token_not_found')) {
      console.log('AuthStore: Invalid refresh token, clearing session');
      await supabase.auth.signOut();
    }
    setAuthState(null, false);
  }
};