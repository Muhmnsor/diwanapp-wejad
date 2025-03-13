import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Role } from "../types";
import { toast } from "sonner";

export const useUsersData = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) throw profilesError;

      // Fetch user roles
      const { data: userRoles, error: userRolesError } = await supabase
        .from('user_roles')
        .select('user_id, roles(id, name)');
      
      if (userRolesError) throw userRolesError;
      
      // Map users with their roles
      const mappedUsers = profiles.map((profile: any) => {
        const userRole = userRoles.find((ur: any) => ur.user_id === profile.id);
        
        // Handle the roles object correctly, checking if it exists and has a name property
        let roleName = 'No Role';
        if (userRole && userRole.roles) {
          // Handle case where roles might be an object or array
          if (typeof userRole.roles === 'object' && userRole.roles !== null) {
            // Check if it's an array
            if (Array.isArray(userRole.roles)) {
              // Use the first role in the array if it exists
              roleName = userRole.roles[0]?.name || 'No Role';
            } else {
              // Otherwise it's an object with a name property
              roleName = userRole.roles.name || 'No Role';
            }
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
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("حدث خطأ أثناء جلب بيانات المستخدمين");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*');
      
      if (error) throw error;
      
      setRoles(data);
    } catch (error) {
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

  return { users, roles, isLoading, refetchUsers };
};
