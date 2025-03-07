
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Workspace } from "@/types/workspace";
import { User } from "@/store/refactored-auth/types";

export const useWorkspacePermissions = (workspace: Workspace, user: User | null) => {
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    const checkPermissions = async () => {
      if (!user) {
        setCanEdit(false);
        return;
      }

      try {
        const isCreator = workspace.created_by === user.id;
        
        // Check if user is admin
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('roles:role_id(name)')
          .eq('user_id', user.id)
          .single();
        
        // Access the name property safely with optional chaining
        const isAdmin = roleData?.roles?.name === 'admin';
        
        // Check if user is workspace admin
        const { data: memberData } = await supabase
          .from('workspace_members')
          .select('role')
          .eq('workspace_id', workspace.id)
          .eq('user_id', user.id)
          .single();
        
        const isWorkspaceAdmin = memberData?.role === 'admin';
        
        setCanEdit(isCreator || isAdmin || isWorkspaceAdmin);
      } catch (error) {
        console.error('Error checking permissions:', error);
        setCanEdit(false);
      }
    };
    
    checkPermissions();
  }, [workspace.id, workspace.created_by, user]);

  return { canEdit };
};
