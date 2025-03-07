
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Workspace } from "@/types/workspace";
import { User } from "@/store/refactored-auth/types";
import { toast } from "sonner";

export const useWorkspacePermissions = (workspace: Workspace, user: User | null) => {
  const [canEdit, setCanEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkPermissions = async () => {
      if (!user) {
        setCanEdit(false);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        console.log("Checking permissions for workspace:", workspace.id, "user:", user.id);
        
        // Check if user is the creator of the workspace
        const isCreator = workspace.created_by === user.id;
        console.log("Is creator:", isCreator);
        
        // Check if user is admin using the is_admin database function
        const { data: isAdminData, error: adminError } = await supabase
          .rpc('is_admin', { user_id: user.id });
          
        if (adminError) {
          console.error('Error checking admin status:', adminError);
          throw adminError;
        }
        
        const isAdmin = !!isAdminData;
        console.log("Is admin:", isAdmin);
        
        // Check if user is workspace admin
        const { data: memberData, error: memberError } = await supabase
          .from('workspace_members')
          .select('role')
          .eq('workspace_id', workspace.id)
          .eq('user_id', user.id)
          .single();
        
        if (memberError && memberError.code !== 'PGRST116') { // PGRST116 is 'no rows returned'
          console.error('Error checking workspace membership:', memberError);
          throw memberError;
        }
        
        const isWorkspaceAdmin = memberData?.role === 'admin';
        console.log("Is workspace admin:", isWorkspaceAdmin);
        
        const hasEditPermission = isCreator || isAdmin || isWorkspaceAdmin;
        console.log("Final permission result:", hasEditPermission);
        
        setCanEdit(hasEditPermission);
      } catch (err) {
        console.error('Error checking permissions:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setCanEdit(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkPermissions();
  }, [workspace.id, workspace.created_by, user]);

  return { canEdit, isLoading, error };
};
