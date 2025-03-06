
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface UseTaskPermissionsProps {
  taskId: string;
  assignedTo?: string | null;
  createdBy?: string | null;
}

export const useTaskPermissions = ({ taskId, assignedTo, createdBy }: UseTaskPermissionsProps) => {
  const { user } = useAuthStore();
  const [canEdit, setCanEdit] = useState<boolean>(false);
  const [canDelete, setCanDelete] = useState<boolean>(false);
  const [canChangeStatus, setCanChangeStatus] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  
  useEffect(() => {
    const checkPermissions = async () => {
      if (!user) {
        setCanEdit(false);
        setCanDelete(false);
        setCanChangeStatus(false);
        return;
      }
      
      // Check if user is admin
      let userIsAdmin = user.isAdmin || false;
      
      // If admin status is not clear from the auth store, check from database
      if (!userIsAdmin && user.id) {
        try {
          const { data: userRole, error } = await supabase
            .from('user_roles')
            .select(`
              roles (
                name
              )
            `)
            .eq('user_id', user.id)
            .single();
          
          if (!error && userRole?.roles) {
            const roleName = typeof userRole.roles === 'object' ? 
              Array.isArray(userRole.roles) ? 
                (userRole.roles[0] && userRole.roles[0].name) : 
                (userRole.roles as { name: string }).name 
              : '';
            
            userIsAdmin = ['admin', 'app_admin'].includes(roleName);
          }
        } catch (error) {
          console.error("Error checking user permissions:", error);
        }
      }

      setIsAdmin(userIsAdmin);
      
      // Check if user is the creator of the task
      const isCreator = createdBy === user.id;
      
      // Check if user is assigned to the task
      const isAssignee = assignedTo === user.id;
      
      // Set permissions based on role
      setCanEdit(userIsAdmin || isCreator);
      setCanDelete(userIsAdmin || isCreator);
      setCanChangeStatus(userIsAdmin || isCreator || isAssignee);
    };
    
    checkPermissions();
  }, [user, assignedTo, createdBy]);
  
  return { 
    canEdit, 
    canDelete, 
    canChangeStatus,
    isAdmin
  };
};
