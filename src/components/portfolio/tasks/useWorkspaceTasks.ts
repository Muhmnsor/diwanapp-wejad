
import { useQuery } from '@tanstack/react-query';
import { getOrCreateWorkspace, syncTasksWithAsana, fetchWorkspaceTasks } from './api/workspaceApi';

export const useWorkspaceTasks = (workspaceId: string) => {
  return useQuery({
    queryKey: ['portfolio-tasks', workspaceId],
    queryFn: async () => {
      console.log('🔄 Starting task fetch process for workspace:', workspaceId);
      
      try {
        // 1. التحقق من وجود مساحة العمل أو إنشائها
        const workspace = await getOrCreateWorkspace(workspaceId);
        console.log('✅ Workspace verified:', workspace);

        // 2. جلب حالة المزامنة
        const { data: syncStatus } = await supabase
          .from('workspace_sync_status')
          .select('*')
          .eq('workspace_id', workspaceId)
          .single();

        console.log('📊 Current sync status:', syncStatus);

        // 3. مزامنة المهام مع Asana إذا لزم الأمر
        const syncedTasks = await syncTasksWithAsana(workspaceId);
        console.log('✅ Tasks synced:', syncedTasks);
        
        // 4. جلب المهام المحدثة
        const tasks = await fetchWorkspaceTasks(workspace.id);
        console.log('✅ Final tasks:', tasks);
        
        return {
          tasks: tasks || [],
          syncStatus: syncStatus || null
        };
      } catch (error) {
        console.error('❌ Error in useWorkspaceTasks:', error);
        throw error;
      }
    },
    retry: 2,
    retryDelay: 1000
  });
};
