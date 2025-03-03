
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ProjectMember {
  id: string;
  user_id: string;
  workspace_id: string;
  user_display_name: string;
  user_email: string;
}

export const useProjectMembers = (projectId: string | undefined) => {
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProjectMembers = async () => {
      if (!projectId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // First get the workspace associated with this project
        const { data: projectData, error: projectError } = await supabase
          .from('project_tasks')
          .select('workspace_id')
          .eq('id', projectId)
          .single();
        
        if (projectError || !projectData) {
          throw new Error(`Error fetching project workspace: ${projectError?.message || "No data returned"}`);
        }
        
        // Then get all members of this workspace
        const { data: membersData, error: membersError } = await supabase
          .from('workspace_members')
          .select('*')
          .eq('workspace_id', projectData.workspace_id);
        
        if (membersError) {
          throw new Error(`Error fetching workspace members: ${membersError.message}`);
        }
        
        setProjectMembers(membersData || []);
      } catch (error) {
        console.error("Error fetching project members:", error);
        setError(error instanceof Error ? error : new Error(String(error)));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjectMembers();
  }, [projectId]);

  return { projectMembers, isLoading, error };
};
