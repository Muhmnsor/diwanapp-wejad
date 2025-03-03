
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkspaceMember } from "@/types/workspace";

export const useWorkspaceMembers = (workspaceId: string, isDialogOpen: boolean) => {
  // Fetch workspace members
  const { 
    data: members, 
    isLoading: isMembersLoading 
  } = useQuery({
    queryKey: ['workspace-members', workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', workspaceId);
      
      if (error) throw error;
      return data as WorkspaceMember[];
    },
    enabled: isDialogOpen // Solo consultar cuando el diálogo esté abierto
  });

  // Fetch users list
  const { 
    data: users, 
    isLoading: isUsersLoading 
  } = useQuery({
    queryKey: ['users-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, display_name');
      
      if (error) throw error;
      return data;
    },
    enabled: isDialogOpen
  });

  return {
    members,
    users,
    isMembersLoading,
    isUsersLoading
  };
};
