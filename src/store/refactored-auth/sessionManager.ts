
import { supabase } from '@/integrations/supabase/client';
import { User } from './types';

export const checkUserRole = async (userId: string): Promise<boolean> => {
  // Check for developer role
  const { data: userRoles, error: roleIdsError } = await supabase
    .from('user_roles')
    .select('role_id, roles(name)')
    .eq('user_id', userId);

  if (roleIdsError) {
    console.error("SessionManager: Error fetching role IDs:", roleIdsError);
    return false;
  }

  if (!userRoles || userRoles.length === 0) {
    console.log("SessionManager: No roles found for user");
    return false;
  }

  // Check if any role is a developer role
  for (const userRole of userRoles) {
    if (userRole.roles) {
      const roleName = typeof userRole.roles === 'object' && userRole.roles !== null ? 
        // Handle both array and object response formats
        (Array.isArray(userRole.roles) ? userRole.roles[0]?.name : (userRole.roles as any).name) : 
        null;
        
      if (roleName === 'developer') {
        return true;
      }
    }
  }

  return false;
};

// Check if user has admin role
export const checkAdminRole = async (userId: string): Promise<boolean> => {
  const { data: userRoles, error: roleIdsError } = await supabase
    .from('user_roles')
    .select('role_id, roles(name)')
    .eq('user_id', userId);

  if (roleIdsError) {
    console.error("SessionManager: Error checking admin role:", roleIdsError);
    return false;
  }

  if (!userRoles || userRoles.length === 0) {
    console.log("SessionManager: No roles found for user");
    return false;
  }

  // Check if any role is an admin role
  for (const userRole of userRoles) {
    if (userRole.roles) {
      const roleName = typeof userRole.roles === 'object' && userRole.roles !== null ? 
        // Handle both array and object response formats
        (Array.isArray(userRole.roles) ? userRole.roles[0]?.name : (userRole.roles as any).name) : 
        null;
        
      if (roleName === 'admin' || roleName === 'app_admin') {
        return true;
      }
    }
  }

  return false;
};

export const getUserRole = async (userId: string): Promise<string | null> => {
  try {
    const { data: userRoles, error } = await supabase
      .from('user_roles')
      .select(`
        roles(name)
      `)
      .eq('user_id', userId);
    
    if (error) {
      console.error("SessionManager: Error fetching user role:", error);
      return null;
    }
    
    if (!userRoles || userRoles.length === 0) {
      return null;
    }
    
    // Find the first valid role
    for (const userRole of userRoles) {
      if (userRole?.roles) {
        if (Array.isArray(userRole.roles)) {
          return userRole.roles[0]?.name || null;
        } else {
          return (userRole.roles as any).name || null;
        }
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
    const isAdmin = await checkAdminRole(session.user.id);
    const role = await getUserRole(session.user.id);

    console.log("SessionManager: Session initialized:", {
      userId: session.user.id,
      email: session.user.email,
      isDeveloper: isDev,
      isAdmin: isAdmin,
      role: role
    });

    return {
      user: {
        id: session.user.id,
        email: session.user.email ?? '',
        isAdmin: isAdmin,
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
