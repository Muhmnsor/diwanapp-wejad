
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Workspace } from "@/types/workspace";
import { User } from "@/store/refactored-auth/types";

export const useWorkspacePermissions = (workspace: Workspace, user: User | null) => {
  const [canEdit, setCanEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPermissions = async () => {
      setIsLoading(true);
      
      if (!user || !workspace) {
        setCanEdit(false);
        setIsLoading(false);
        return;
      }

      try {
        // Case 1: User is the creator of the workspace
        const isCreator = workspace.created_by === user.id;
        
        // Case 2: Check if user is a system admin
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role:role_id(name)')
          .eq('user_id', user.id)
          .single();
        
        if (roleError && roleError.code !== 'PGRST116') {
          console.error('Error checking user roles:', roleError);
        }
        
        // Access the name property safely with optional chaining
        // Handle the case where role could be an object with a name property
        const roleName = roleData?.role?.name;
        const isAdmin = roleName === 'admin' || roleName === 'app_admin';
        
        // Case 3: Check if user is workspace admin
        const { data: memberData, error: memberError } = await supabase
          .from('workspace_members')
          .select('role')
          .eq('workspace_id', workspace.id)
          .eq('user_id', user.id)
          .single();
        
        if (memberError && memberError.code !== 'PGRST116') {
          console.error('Error checking workspace membership:', memberError);
        }
        
        const isWorkspaceAdmin = memberData?.role === 'admin';
        
        // Set permissions based on any of the three cases
        const hasEditPermission = isCreator || isAdmin || isWorkspaceAdmin;
        console.log('Permission check:', { 
          workspace: workspace.id,
          isCreator, 
          isAdmin, 
          isWorkspaceAdmin, 
          hasPermission: hasEditPermission 
        });
        
        setCanEdit(hasEditPermission);
      } catch (error) {
        console.error('Error checking permissions:', error);
        setCanEdit(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkPermissions();
  }, [workspace.id, workspace.created_by, user]);

  return { canEdit, isLoading };
};
