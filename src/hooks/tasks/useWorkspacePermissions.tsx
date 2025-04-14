import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useWorkspacePermissions = (workspaceId: string) => {
  const { user } = useAuthStore();

  const { data: permissions } = useQuery({
    queryKey: ['workspace-permissions', workspaceId, user?.id],
    queryFn: async () => {
      if (!user?.id) return { isManager: false, isAdmin: false };

      // Check if user is workspace manager
      const { data: member } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .single();

      // Check if user is system admin
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      const isAdmin = roles?.some(r => r.role === 'admin') || false;
      const isManager = member?.role === 'manager' || false;

      return { isManager, isAdmin };
    },
    enabled: !!user?.id && !!workspaceId
  });

  const canManageProjects = permissions?.isManager || permissions?.isAdmin || false;

  return { canManageProjects };
};

