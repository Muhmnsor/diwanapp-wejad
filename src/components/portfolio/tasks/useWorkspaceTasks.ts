
import { useQuery } from '@tanstack/react-query';
import { getOrCreateWorkspace, fetchWorkspaceTasks } from './api/workspaceApi';

export const useWorkspaceTasks = (workspaceId: string) => {
  return useQuery({
    queryKey: ['portfolio-tasks', workspaceId],
    queryFn: async () => {
      console.log('🔄 Starting task fetch process for workspace:', workspaceId);
      
      try {
        // 1. التحقق من وجود مساحة العمل أو إنشائها
        const workspace = await getOrCreateWorkspace(workspaceId);
        console.log('✅ Using workspace:', workspace);
        
        // 2. جلب المهام
        const tasks = await fetchWorkspaceTasks(workspace.id);
        console.log('✅ Final tasks:', tasks);
        
        return tasks || [];
      } catch (error) {
        console.error('❌ Error in useWorkspaceTasks:', error);
        throw error;
      }
    },
    retry: 2,
    retryDelay: 1000
  });
};
