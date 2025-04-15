import { useAuthStore } from '@/store/refactored-auth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useWorkspacePermissions = (workspaceId: string, projectId: string) => {
  const { user } = useAuthStore();

  const { data: permissions } = useQuery({
    queryKey: ['workspace-permissions', workspaceId, projectId],
    queryFn: async () => {
      if (!user?.id) return null;

      // Check if user is workspace manager
      const { data: workspaceMember } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .single();

      // Check if user is project manager
      const { data: project } = await supabase
        .from('project_tasks')
        .select('project_manager')
        .eq('id', projectId)
        .single();

      return {
        isSystemAdmin: user.isAdmin,
        isWorkspaceManager: workspaceMember?.role === 'manager',
        isProjectManager: project?.project_manager === user.id,
        canDelete: user.isAdmin || 
                  workspaceMember?.role === 'manager' || 
                  project?.project_manager === user.id
      };
    },
    enabled: !!user?.id && !!workspaceId && !!projectId
  });

  return {
    ...permissions,
    canDelete: permissions?.canDelete || false
  };
};