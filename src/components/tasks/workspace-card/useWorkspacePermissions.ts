
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Workspace } from "@/types/workspace";
import { User } from "@/store/refactored-auth/types";

export const useWorkspacePermissions = (
  workspace: Workspace | { id: string },
  user: User | null
) => {
  const [canEdit, setCanEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPermissions = async () => {
      setIsLoading(true);
      
      if (!user || !workspace) {
        console.log("[useWorkspacePermissions] No user or workspace, permissions denied");
        setCanEdit(false);
        setIsLoading(false);
        return;
      }

      try {
        console.log("[useWorkspacePermissions] Checking permissions for workspace:", workspace.id, "user:", user.id);
        // Check if user is creator of workspace
        let isCreator = false;
        
        if ('created_by' in workspace) {
          isCreator = workspace.created_by === user.id;
        } else {
          // If we only have workspace ID, fetch the workspace data to check creator
          const { data: workspaceData, error: workspaceError } = await supabase
            .from('workspaces')
            .select('created_by')
            .eq('id', workspace.id)
            .single();
            
          if (workspaceData) {
            isCreator = workspaceData.created_by === user.id;
          } else if (workspaceError) {
            console.error("[useWorkspacePermissions] Error fetching workspace:", workspaceError);
          }
        }
        
        if (isCreator) {
          console.log("[useWorkspacePermissions] User is workspace creator, permissions granted");
          setCanEdit(true);
          setIsLoading(false);
          return;
        }
        
        // Check if user is system admin
        console.log("[useWorkspacePermissions] Checking if user has admin role");
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('roles:role_id(name)')
          .eq('user_id', user.id)
          .single();
        
        if (roleError && roleError.code !== 'PGRST116') {
          console.error("[useWorkspacePermissions] Error checking user roles:", roleError);
        }
          
        // Handle different response formats for roles
        let isAdmin = false;
        
        if (roleData?.roles) {
          console.log("[useWorkspacePermissions] Role data received:", roleData.roles);
          if (typeof roleData.roles === 'object' && !Array.isArray(roleData.roles)) {
            // Handle case when roles is a single object
            isAdmin = (roleData.roles as { name: string }).name === 'admin';
          } 
          else if (Array.isArray(roleData.roles)) {
            // Handle case when roles is an array of objects
            isAdmin = roleData.roles.some((role: any) => 
              role && typeof role === 'object' && role.name === 'admin'
            );
          }
        }
        
        if (isAdmin) {
          console.log("[useWorkspacePermissions] User is system admin, permissions granted");
          setCanEdit(true);
          setIsLoading(false);
          return;
        }
        
        // Check if user is workspace admin
        console.log("[useWorkspacePermissions] Checking if user is workspace admin");
        const { data: memberData, error: memberError } = await supabase
          .from('workspace_members')
          .select('role')
          .eq('workspace_id', workspace.id)
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();
        
        if (memberError && memberError.code !== 'PGRST116') {
          console.error("[useWorkspacePermissions] Error checking workspace membership:", memberError);
        }
        
        if (memberData) {
          console.log("[useWorkspacePermissions] User is workspace admin, permissions granted");
          setCanEdit(true);
        } else {
          console.log("[useWorkspacePermissions] User does not have required permissions");
          setCanEdit(false);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("[useWorkspacePermissions] Error checking permissions:", error);
        console.error("[useWorkspacePermissions] Error details:", JSON.stringify(error));
        setCanEdit(false);
        setIsLoading(false);
      }
    };
    
    checkPermissions();
  }, [workspace, user]);

  return { canEdit, isLoading };
};
