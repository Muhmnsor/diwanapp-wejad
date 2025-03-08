
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface WorkspaceMemberDetails {
  user_id: string;
  display_name: string;
  email: string;
  role: string;
}

export const useWorkspaceMembers = (workspaceId: string | undefined) => {
  const [members, setMembers] = useState<WorkspaceMemberDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchMembers = async () => {
      if (!workspaceId) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        // Fetch workspace members with profile information
        const { data, error } = await supabase
          .from('workspace_members')
          .select('*, profiles:user_id(id, display_name, email)')
          .eq('workspace_id', workspaceId);
          
        if (error) throw error;
        
        // Map to the structure needed
        const membersList = data.map(member => ({
          user_id: member.user_id,
          display_name: member.profiles?.display_name || 'Unknown User',
          email: member.profiles?.email || 'No email',
          role: member.role || 'member'
        }));
        
        setMembers(membersList);
      } catch (error) {
        console.error("Error fetching workspace members:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMembers();
  }, [workspaceId]);
  
  return {
    members,
    isLoading
  };
};
