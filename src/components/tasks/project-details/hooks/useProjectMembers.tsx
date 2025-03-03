
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
        console.log("Fetching members for project ID:", projectId);
        
        // First get the workspace associated with this project
        const { data: projectData, error: projectError } = await supabase
          .from('project_tasks')
          .select('workspace_id')
          .eq('id', projectId)
          .single();
        
        if (projectError || !projectData) {
          console.error("Error fetching project:", projectError);
          throw new Error(`Error fetching project workspace: ${projectError?.message || "No data returned"}`);
        }
        
        console.log("Found workspace ID:", projectData.workspace_id);
        
        // If no workspace found, try to fetch all users instead
        if (!projectData.workspace_id) {
          console.log("No workspace ID found, fetching all users");
          const { data: usersData, error: usersError } = await supabase
            .from('profiles')
            .select('id, display_name, email');
          
          if (usersError) {
            throw new Error(`Error fetching users: ${usersError.message}`);
          }
          
          const mappedUsers = usersData?.map(user => ({
            id: user.id,
            user_id: user.id,
            workspace_id: '',
            user_display_name: user.display_name || '',
            user_email: user.email || ''
          })) || [];
          
          console.log("Fetched users:", mappedUsers.length);
          setProjectMembers(mappedUsers);
          return;
        }
        
        // Then get all members of this workspace
        const { data: membersData, error: membersError } = await supabase
          .from('workspace_members')
          .select('id, user_id, workspace_id, user_display_name, user_email')
          .eq('workspace_id', projectData.workspace_id);
        
        if (membersError) {
          console.error("Error fetching workspace members:", membersError);
          throw new Error(`Error fetching workspace members: ${membersError.message}`);
        }
        
        console.log("Fetched workspace members:", membersData?.length || 0);
        
        // If no workspace members, fetch all users
        if (!membersData || membersData.length === 0) {
          console.log("No workspace members found, fetching all users");
          const { data: usersData, error: usersError } = await supabase
            .from('profiles')
            .select('id, display_name, email');
          
          if (usersError) {
            throw new Error(`Error fetching users: ${usersError.message}`);
          }
          
          const mappedUsers = usersData?.map(user => ({
            id: user.id,
            user_id: user.id,
            workspace_id: projectData.workspace_id || '',
            user_display_name: user.display_name || '',
            user_email: user.email || ''
          })) || [];
          
          console.log("Fetched users:", mappedUsers.length);
          setProjectMembers(mappedUsers);
          return;
        }
        
        setProjectMembers(membersData || []);
      } catch (error) {
        console.error("Error fetching project members:", error);
        setError(error instanceof Error ? error : new Error(String(error)));
        
        // Fallback: attempt to fetch just regular users from profiles
        try {
          console.log("Trying fallback: fetching all users");
          const { data: usersData, error: usersError } = await supabase
            .from('profiles')
            .select('id, display_name, email');
          
          if (!usersError && usersData) {
            const mappedUsers = usersData.map(user => ({
              id: user.id,
              user_id: user.id,
              workspace_id: '',
              user_display_name: user.display_name || '',
              user_email: user.email || ''
            }));
            
            console.log("Fallback successful, fetched users:", mappedUsers.length);
            setProjectMembers(mappedUsers);
          }
        } catch (fallbackError) {
          console.error("Fallback also failed:", fallbackError);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjectMembers();
  }, [projectId]);

  return { projectMembers, isLoading, error };
};
