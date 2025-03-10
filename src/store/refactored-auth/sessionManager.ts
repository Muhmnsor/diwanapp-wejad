import { supabase } from '@/integrations/supabase/client';
import { User } from './types';

export const checkUserRole = async (userId: string): Promise<boolean> => {
  const { data: roleIds, error: roleIdsError } = await supabase
    .from('user_roles')
    .select('role_id')
    .eq('user_id', userId)
    .single();

  if (roleIdsError) {
    console.error("SessionManager: Error fetching role IDs:", roleIdsError);
    return false;
  }

  if (!roleIds) {
    console.log("SessionManager: No roles found for user");
    return false;
  }

  const { data: roles, error: rolesError } = await supabase
    .from('roles')
    .select('name')
    .eq('id', roleIds.role_id)
    .single();

  if (rolesError) {
    console.error("SessionManager: Error fetching role names:", rolesError);
    return false;
  }

  return roles?.name === 'developer';
};

export const getUserRole = async (userId: string): Promise<string | null> => {
  try {
    const { data: userRole, error } = await supabase
      .from('user_roles')
      .select(`
        roles (
          name
        )
      `)
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error("SessionManager: Error fetching user role:", error);
      return null;
    }
    
    if (userRole?.roles) {
      if (Array.isArray(userRole.roles)) {
        return userRole.roles[0]?.name || null;
      } else {
        return (userRole.roles as any).name || null;
      }
    }
    
    return null;
  } catch (error) {
    console.error("SessionManager: Error in getUserRole:", error);
    return null;
  }
};

export const initializeSession = async (): Promise<{ user: User | null; isAuthenticated: boolean }> => {
  console.log("SessionManager: Initializing session");
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("SessionManager: Session error:", error);
      return { user: null, isAuthenticated: false };
    }

    if (!session?.user) {
      console.log("SessionManager: No active session");
      return { user: null, isAuthenticated: false };
    }

    const isDev = await checkUserRole(session.user.id);
    const role = await getUserRole(session.user.id);

    return {
      user: {
        id: session.user.id,
        email: session.user.email ?? '',
        isAdmin: false,
        role: role || undefined
      },
      isAuthenticated: true
    };
  } catch (error) {
    console.error("SessionManager: Initialization error:", error);
    return { user: null, isAuthenticated: false };
  }
};

export const clearSession = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    localStorage.removeItem('supabase.auth.token');
    sessionStorage.clear();
    
    console.log("SessionManager: Session cleared successfully");
  } catch (error) {
    console.error("SessionManager: Error clearing session:", error);
    throw error;
  }
};
