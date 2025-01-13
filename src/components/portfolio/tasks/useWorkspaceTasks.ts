import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useWorkspaceTasks = (workspaceId: string) => {
  return useQuery({
    queryKey: ['portfolio-tasks', workspaceId],
    queryFn: async () => {
      console.log('Fetching tasks for workspace:', workspaceId);
      
      let { data: workspace, error: workspaceError } = await supabase
        .from('portfolio_workspaces')
        .select('id')
        .eq('asana_gid', workspaceId)
        .maybeSingle();

      if (workspaceError) {
        console.error('Error fetching workspace:', workspaceError);
        throw workspaceError;
      }

      if (!workspace) {
        console.log('Workspace not found, creating new workspace');
        const { data: newWorkspace, error: createError } = await supabase
          .from('portfolio_workspaces')
          .insert([
            { 
              asana_gid: workspaceId,
              name: 'مساحة عمل جديدة'
            }
          ])
          .select('id')
          .single();

        if (createError) {
          console.error('Error creating workspace:', createError);
          throw createError;
        }

        workspace = newWorkspace;
      }

      console.log('Using workspace ID:', workspace.id);

      const { data, error } = await supabase
        .from('portfolio_tasks')
        .select(`
          *,
          assigned_to (
            email
          )
        `)
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }

      console.log('Fetched tasks:', data);
      return data;
    },
    refetchInterval: 5000
  });
};