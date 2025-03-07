
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
        // The role property might be returned in different formats depending on the query
        let roleName = null;
        
        // Check if roleData exists and has a role property
        if (roleData && roleData.role) {
          // Handle different possible structures of the role data
          if (typeof roleData.role === 'object') {
            // If role is an object, try to get name from it
            roleName = roleData.role.name;
          } else if (Array.isArray(roleData.role) && roleData.role.length > 0) {
            // If role is an array, get name from the first element
            roleName = roleData.role[0]?.name;
          } else {
            // If role is a direct string value
            roleName = roleData.role;
          }
        }
        
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
