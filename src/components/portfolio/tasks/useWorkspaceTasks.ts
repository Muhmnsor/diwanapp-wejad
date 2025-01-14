import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useWorkspaceTasks = (workspaceId: string) => {
  return useQuery({
    queryKey: ['portfolio-tasks', workspaceId],
    queryFn: async () => {
      console.log('Fetching tasks for workspace:', workspaceId);
      
      // 1. أولاً، نتحقق من وجود مساحة العمل في قاعدة البيانات
      let { data: workspace, error: workspaceError } = await supabase
        .from('portfolio_workspaces')
        .select('id')
        .eq('asana_gid', workspaceId)
        .maybeSingle();

      if (workspaceError) {
        console.error('Error fetching workspace:', workspaceError);
        throw workspaceError;
      }

      // 2. إذا لم تكن موجودة، نقوم بإنشائها
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

      // 3. نقوم بجلب المهام من قاعدة البيانات مع معلومات المستخدم المسند إليه
      const { data: tasks, error: tasksError } = await supabase
        .from('portfolio_tasks')
        .select(`
          *,
          assigned_to (
            email
          )
        `)
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false });

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
        throw tasksError;
      }

      // 4. نقوم بمزامنة المهام مع Asana
      const { data: syncedTasks, error: syncError } = await supabase
        .functions.invoke('get-workspace', {
          body: { workspaceId }
        });

      if (syncError) {
        console.error('Error syncing with Asana:', syncError);
        // نستمر بإرجاع المهام المحلية حتى لو فشلت المزامنة
      }

      console.log('Fetched tasks:', tasks);
      console.log('Synced tasks from Asana:', syncedTasks);

      return tasks || [];
    },
    refetchInterval: 5000 // تحديث كل 5 ثواني
  });
};