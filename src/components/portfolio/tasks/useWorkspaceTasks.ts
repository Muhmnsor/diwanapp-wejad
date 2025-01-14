import { useQuery } from '@tanstack/react-query';
import { getOrCreateWorkspace, syncTasksWithAsana, fetchWorkspaceTasks } from './api/workspaceApi';
import { upsertTasks } from './api/taskApi';

export const useWorkspaceTasks = (workspaceId: string) => {
  return useQuery({
    queryKey: ['portfolio-tasks', workspaceId],
    queryFn: async () => {
      console.log('🔄 Starting task fetch process for workspace:', workspaceId);
      
      // 1. التحقق من وجود مساحة العمل أو إنشائها
      const workspace = await getOrCreateWorkspace(workspaceId);
      console.log('✅ Using workspace ID:', workspace.id);

      // 2. مزامنة المهام مع Asana
      const syncedTasks = await syncTasksWithAsana(workspaceId);
      
      // 3. تحديث المهام في قاعدة البيانات
      if (syncedTasks) {
        await upsertTasks(syncedTasks, workspace.id);
      }

      // 4. جلب المهام المحدثة
      return await fetchWorkspaceTasks(workspace.id);
    },
    refetchInterval: 5000
  });
};