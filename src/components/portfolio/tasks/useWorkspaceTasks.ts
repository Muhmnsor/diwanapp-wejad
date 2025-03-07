
import { useCachedQuery } from '@/hooks/useCachedQuery';
import { Task } from '@/components/tasks/types/task';
import { getOrCreateWorkspace, syncTasksWithAsana, fetchWorkspaceTasks } from './api/workspaceApi';

export const useWorkspaceTasks = (workspaceId: string) => {
  return useCachedQuery<Task[]>(
    ['portfolio-tasks', workspaceId],
    async () => {
      console.log('🔄 Starting task fetch process for workspace:', workspaceId);
      
      try {
        // 1. التحقق من وجود مساحة العمل أو إنشائها
        const workspace = await getOrCreateWorkspace(workspaceId);
        console.log('✅ Using workspace:', workspace);

        // 2. مزامنة المهام مع Asana
        const syncedTasks = await syncTasksWithAsana(workspaceId);
        console.log('✅ Synced tasks:', syncedTasks);
        
        // 3. جلب المهام المحدثة
        const tasks = await fetchWorkspaceTasks(workspace.id);
        console.log('✅ Final tasks:', tasks);
        
        return tasks || [];
      } catch (error) {
        console.error('❌ Error in useWorkspaceTasks:', error);
        throw error;
      }
    },
    {
      // Enhanced caching options
      cacheDuration: 5 * 60 * 1000, // 5 minutes
      cacheStorage: 'memory',
      cachePrefix: 'workspace',
      useCompression: true,
      compressionThreshold: 512, // Compress if larger than 512 bytes
      cachePriority: 'high',
      batchUpdates: true,
      tags: ['workspace', `workspace-${workspaceId}`, 'tasks'],
      refreshStrategy: 'lazy',
      refreshThreshold: 75,
      
      // Add offline support
      offlineFirst: true,
      
      // Enable progressive loading
      progressiveLoading: {
        enabled: true,
        chunkSize: 10,
        initialChunkSize: 5,
        onChunkLoaded: (chunk, progress) => {
          console.log(`Loaded chunk of ${chunk.length} workspace tasks. Progress: ${progress}%`);
        }
      },
      
      // Add partitioned query for very large datasets
      usePartitionedQuery: false, // Enable for very large datasets
      
      // Add retry logic
      retry: 2,
      retryDelay: 1000
    }
  );
};
