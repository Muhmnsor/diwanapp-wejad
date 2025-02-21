
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getOrCreateWorkspace, syncTasksWithAsana, fetchWorkspaceTasks } from './api/workspaceApi';

export interface TasksData {
  tasks: Array<{
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    due_date: string | null;
    assigned_to: string | null;
    updated_at: string;
    asana_gid: string;
  }>;
  syncStatus: {
    last_sync_at: string | null;
    last_sync_status: string;
    sync_error: string | null;
  } | null;
}

export const useWorkspaceTasks = (workspaceId: string) => {
  return useQuery<TasksData>({
    queryKey: ['portfolio-tasks', workspaceId],
    queryFn: async () => {
      console.log('🔄 Starting task fetch process for workspace:', workspaceId);
      
      try {
        // 1. التحقق من وجود مساحة العمل أو إنشائها
        const workspace = await getOrCreateWorkspace(workspaceId);
        console.log('✅ Workspace verified:', workspace);

        // 2. مزامنة المهام مع Asana للحصول على أحدث البيانات
        await syncTasksWithAsana(workspaceId);
        console.log('✅ Tasks synced with Asana');
        
        // 3. جلب حالة المزامنة المحدثة
        const { data: syncStatus, error: syncError } = await supabase
          .from('workspace_sync_status')
          .select('*')
          .eq('workspace_id', workspaceId)
          .single();

        if (syncError && syncError.code !== 'PGRST116') {
          console.error('Error fetching sync status:', syncError);
          throw syncError;
        }

        console.log('📊 Current sync status:', syncStatus);
        
        // 4. جلب المهام المحدثة
        const tasks = await fetchWorkspaceTasks(workspace.id);
        console.log('✅ Final tasks:', tasks);
        
        return {
          tasks: tasks || [],
          syncStatus: syncStatus
        };
      } catch (error) {
        console.error('❌ Error in useWorkspaceTasks:', error);
        throw error;
      }
    },
    retry: 2,
    retryDelay: 1000,
    // تحديث كل 30 ثانية للحصول على أحدث البيانات
    refetchInterval: 30000
  });
};
