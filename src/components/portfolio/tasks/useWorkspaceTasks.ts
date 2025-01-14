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

      // 3. نقوم بمزامنة المهام مع Asana أولاً
      const { data: syncedTasks, error: syncError } = await supabase
        .functions.invoke('get-workspace', {
          body: { workspaceId }
        });

      if (syncError) {
        console.error('Error syncing with Asana:', syncError);
        // نستمر بإرجاع المهام المحلية حتى لو فشلت المزامنة
      } else {
        console.log('Successfully synced tasks from Asana:', syncedTasks);
        
        // تحديث المهام في قاعدة البيانات
        if (syncedTasks?.tasks?.length > 0) {
          const { error: upsertError } = await supabase
            .from('portfolio_tasks')
            .upsert(
              syncedTasks.tasks.map((task: any) => ({
                workspace_id: workspace.id,
                title: task.name,
                description: task.notes,
                status: task.completed ? 'completed' : 'pending',
                priority: task.priority || 'medium',
                due_date: task.due_date,
                asana_gid: task.gid,
                assigned_to: task.assignee?.gid,
                updated_at: new Date().toISOString()
              })),
              { onConflict: 'asana_gid' }
            );

          if (upsertError) {
            console.error('Error upserting tasks:', upsertError);
          }
        }
      }

      // 4. نقوم بجلب المهام المحدثة من قاعدة البيانات
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

      console.log('Fetched tasks from database:', tasks);
      return tasks || [];
    },
    refetchInterval: 5000 // تحديث كل 5 ثواني
  });
};