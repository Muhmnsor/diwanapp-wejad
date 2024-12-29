import { supabase } from '@/integrations/supabase/client';
import { User } from './types';

export const fetchUserRoles = async (userId: string): Promise<boolean> => {
  const { data: roleIds, error: roleIdsError } = await supabase
    .from('user_roles')
    .select('role_id')
    .eq('user_id', userId);

  if (roleIdsError) {
    console.error("AuthUtils: Error fetching role IDs:", roleIdsError);
    return false;
  }

  if (!roleIds?.length) {
    console.log("AuthUtils: No roles found for user");
    return false;
  }

  const { data: roles, error: rolesError } = await supabase
    .from('roles')
    .select('name')
    .in('id', roleIds.map(r => r.role_id));

  if (rolesError) {
    console.error("AuthUtils: Error fetching role names:", rolesError);
    return false;
  }

  return roles?.some(role => role.name === 'admin') ?? false;
}

export const createUserState = (userId: string, email: string, isAdmin: boolean): User => ({
  id: userId,
  email: email,
  isAdmin: isAdmin
});