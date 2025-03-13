
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Role, UserRoleData } from "../types";
import { toast } from "sonner";

export const useUsersData = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) throw profilesError;

      // Log the structure of profiles to understand the data
      console.log("Profiles fetched:", profiles);

      // Fetch user roles with proper join structure
      const { data: userRoles, error: userRolesError } = await supabase
        .from('user_roles')
        .select(`
          id,
          user_id,
          role_id,
          roles:role_id(id, name, description)
        `);
      
      if (userRolesError) throw userRolesError;
      
      // Log the structure of user roles to debug
      console.log("User roles fetched:", userRoles);
      
      // Map users with their roles
      const mappedUsers = profiles.map((profile: any) => {
        // Find role data for this user
        const userRoleData = userRoles ? userRoles.find((ur: any) => ur.user_id === profile.id) : null;
        
        // Default role name
        let roleName = 'No Role';
        
        // Handle role data safely with proper type checking
        if (userRoleData && userRoleData.roles) {
          // If roles is an array, take the first one's name
          if (Array.isArray(userRoleData.roles)) {
            roleName = userRoleData.roles.length > 0 && userRoleData.roles[0]?.name ? 
                      userRoleData.roles[0].name : 'No Role';
          } 
          // If roles is a single object, use its name property
          else if (typeof userRoleData.roles === 'object' && userRoleData.roles !== null) {
            // Cast to any to avoid TypeScript errors since we've verified it's an object
            const roleObject = userRoleData.roles as any;
            roleName = roleObject.name || 'No Role';
          }
        }
        
        return {
          id: profile.id,
          username: profile.username || profile.email,
          displayName: profile.display_name,
          role: roleName,
          lastLogin: profile.last_login,
          isActive: profile.is_active
        };
      });
      
      setUsers(mappedUsers);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      setError(error.message || "حدث خطأ أثناء جلب بيانات المستخدمين");
      toast.error("حدث خطأ أثناء جلب بيانات المستخدمين");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      console.log("Roles fetched:", data);
      setRoles(data || []);
    } catch (error: any) {
      console.error("Error fetching roles:", error);
      toast.error("حدث خطأ أثناء جلب الأدوار");
    }
  };

  const refetchUsers = () => {
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  return { users, roles, isLoading, error, refetchUsers };
};
