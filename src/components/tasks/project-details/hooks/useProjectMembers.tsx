
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
    const fetchAllUsers = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Fetching all users from profiles");
        
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('id, email, display_name');
        
        if (usersError) {
          throw new Error(`Error fetching users: ${usersError.message}`);
        }
        
        const mappedUsers = usersData?.map(user => ({
          id: user.id,
          user_id: user.id,
          workspace_id: '',
          user_display_name: user.display_name || user.email || '',
          user_email: user.email || ''
        })) || [];
        
        console.log(`Fetched ${mappedUsers.length} users from profiles table`);
        setProjectMembers(mappedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError(error instanceof Error ? error : new Error(String(error)));
      } finally {
        setIsLoading(false);
      }
    };

    // Skip the workspace-based approach and directly fetch all users
    fetchAllUsers();
  }, [projectId]);

  return { projectMembers, isLoading, error };
};
