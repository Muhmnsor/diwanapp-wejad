
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
        // Check if user is creator of workspace
        const isCreator = workspace.created_by === user.id;
        
        if (isCreator) {
          setCanEdit(true);
          setIsLoading(false);
          return;
        }
        
        // Check if user is system admin
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('roles:role_id(name)')
          .eq('user_id', user.id)
          .single();
        
        if (roleError && roleError.code !== 'PGRST116') {
          console.error('Error checking user roles:', roleError);
        }
          
        // Handle different response formats for roles
        let isAdmin = false;
        
        if (roleData?.roles) {
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
          setCanEdit(true);
          setIsLoading(false);
          return;
        }
        
        // Check if user is workspace admin
        const { data: memberData, error: memberError } = await supabase
          .from('workspace_members')
          .select('role')
          .eq('workspace_id', workspace.id)
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();
        
        if (memberError && memberError.code !== 'PGRST116') {
          console.error('Error checking workspace membership:', memberError);
        }
        
        setCanEdit(!!memberData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking permissions:', error);
        setCanEdit(false);
        setIsLoading(false);
      }
    };
    
    checkPermissions();
  }, [workspace, user]);

  return { canEdit, isLoading };
};
