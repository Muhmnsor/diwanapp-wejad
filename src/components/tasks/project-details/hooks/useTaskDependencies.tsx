
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DependencyTask {
  id: string;
  title: string;
  status: string;
  dependency_type: string;
}

interface DependencyCounts {
  blocking: number;
  blockedBy: number;
  related: number;
  total: number;
}

export function useTaskDependencies(taskId: string | undefined) {
  const [isLoading, setIsLoading] = useState(true);
  const [isBlockedByDependencies, setIsBlockedByDependencies] = useState(false);
  const [blockedByDependencies, setBlockedByDependencies] = useState<DependencyTask[]>([]);
  const [blockingDependencies, setBlockingDependencies] = useState<DependencyTask[]>([]);
  const [relatedDependencies, setRelatedDependencies] = useState<DependencyTask[]>([]);
  const [dependencyCounts, setDependencyCounts] = useState<DependencyCounts>({
    blocking: 0,
    blockedBy: 0,
    related: 0,
    total: 0
  });

  const fetchDependencies = useCallback(async () => {
    if (!taskId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
      // Fetch tasks this task depends on
      const { data: blockedByData, error: blockedByError } = await supabase
        .from('task_dependencies')
        .select(`
          id,
          dependency_type,
          dependency_task_id,
          tasks:dependency_task_id (
            id,
            title,
            status
          )
        `)
        .eq('task_id', taskId);
        
      if (blockedByError) throw blockedByError;

      // Fetch tasks that depend on this task
      const { data: blockingData, error: blockingError } = await supabase
        .from('task_dependencies')
        .select(`
          id,
          dependency_type,
          task_id,
          tasks:task_id (
            id,
            title,
            status
          )
        `)
        .eq('dependency_task_id', taskId);
        
      if (blockingError) throw blockingError;

      // Process dependencies data
      const formattedBlockedBy = (blockedByData || []).map(dep => ({
        id: dep.id,
        dependency_task_id: dep.dependency_task_id,
        title: dep.tasks?.title || 'Unknown Task',
        status: dep.tasks?.status || 'unknown',
        dependency_type: dep.dependency_type
      }));

      const formattedBlocking = (blockingData || []).map(dep => ({
        id: dep.id,
        task_id: dep.task_id,
        title: dep.tasks?.title || 'Unknown Task',
        status: dep.tasks?.status || 'unknown',
        dependency_type: dep.dependency_type
      }));

      // Filter out different dependency types
      const blockedBy = formattedBlockedBy.filter(dep => 
        dep.dependency_type === 'finish-to-start' || 
        dep.dependency_type === 'start-to-start' || 
        dep.dependency_type === 'finish-to-finish' ||
        dep.dependency_type === 'blocked_by'
      );
      
      const blocking = formattedBlocking.filter(dep => 
        dep.dependency_type === 'finish-to-start' || 
        dep.dependency_type === 'start-to-start' || 
        dep.dependency_type === 'finish-to-finish' ||
        dep.dependency_type === 'blocks'
      );
      
      const related = [
        ...formattedBlockedBy.filter(dep => dep.dependency_type === 'relates_to'),
        ...formattedBlocking.filter(dep => dep.dependency_type === 'relates_to')
      ];

      // Check if task is blocked
      const isBlocked = blockedBy.some(dep => {
        if (dep.status === 'completed') return false;
        
        if (dep.dependency_type === 'finish-to-start' || 
            dep.dependency_type === 'finish-to-finish' || 
            dep.dependency_type === 'blocked_by') {
          return true;
        }
        
        return false;
      });

      // Update state
      setBlockedByDependencies(blockedBy);
      setBlockingDependencies(blocking);
      setRelatedDependencies(related);
      setIsBlockedByDependencies(isBlocked);
      setDependencyCounts({
        blocking: blocking.length,
        blockedBy: blockedBy.length,
        related: related.length,
        total: blocking.length + blockedBy.length + related.length
      });
    } catch (error) {
      console.error('Error fetching task dependencies:', error);
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  const checkDependencyStatus = useCallback(async () => {
    if (!taskId) {
      return { canComplete: true, message: null };
    }

    try {
      // Re-fetch latest dependencies to ensure up-to-date data
      const { data: blockedByData, error: blockedByError } = await supabase
        .from('task_dependencies')
        .select(`
          id,
          dependency_type,
          dependency_task_id,
          tasks:dependency_task_id (
            id,
            title,
            status
          )
        `)
        .eq('task_id', taskId);
        
      if (blockedByError) throw blockedByError;

      // Check for any blocking dependencies
      const blockingDependencies = (blockedByData || []).filter(dep => {
        // For finish-to-X dependencies, prerequisite must be completed
        if ((dep.dependency_type === 'finish-to-start' || 
             dep.dependency_type === 'finish-to-finish' || 
             dep.dependency_type === 'blocked_by') && 
            dep.tasks?.status !== 'completed') {
          return true;
        }
        return false;
      });

      if (blockingDependencies.length > 0) {
        const titles = blockingDependencies.map(dep => dep.tasks?.title || 'Unknown Task').join(', ');
        return {
          canComplete: false,
          message: `لا يمكن إكمال هذه المهمة لأنها تعتمد على المهام التالية: ${titles}`
        };
      }

      return { canComplete: true, message: null };
    } catch (error) {
      console.error('Error checking dependency status:', error);
      return {
        canComplete: false,
        message: 'حدث خطأ أثناء التحقق من حالة التبعيات'
      };
    }
  }, [taskId]);

  // Detect circular dependencies using Depth-First Search
  const detectCircularDependencies = useCallback(async (sourceTaskId: string) => {
    const visited = new Set<string>();
    const recStack = new Set<string>();
    
    async function dfs(currentTaskId: string): Promise<boolean> {
      // Mark the current node as visited and part of recursion stack
      visited.add(currentTaskId);
      recStack.add(currentTaskId);
      
      // Get all dependencies of current task
      const { data: dependencies, error } = await supabase
        .from('task_dependencies')
        .select('dependency_task_id')
        .eq('task_id', currentTaskId);
        
      if (error) {
        console.error('Error during circular dependency check:', error);
        return false;
      }
      
      // Recur for all neighbors
      for (const dep of dependencies || []) {
        const nextTaskId = dep.dependency_task_id;
        
        // If not visited, recursively check
        if (!visited.has(nextTaskId)) {
          if (await dfs(nextTaskId)) {
            return true;  // Found cycle
          }
        } else if (recStack.has(nextTaskId)) {
          // If already in recursion stack, cycle found
          return true;
        }
      }
      
      // Remove current vertex from recursion stack
      recStack.delete(currentTaskId);
      return false;
    }
    
    return dfs(sourceTaskId);
  }, []);

  // Add a new dependency
  const addDependency = useCallback(async (dependencyTaskId: string, dependencyType: string) => {
    if (!taskId) return { success: false, error: 'Invalid task ID' };
    
    try {
      // Check for self-dependency
      if (taskId === dependencyTaskId) {
        return { success: false, error: 'لا يمكن إضافة تبعية للمهمة مع نفسها' };
      }
      
      // Check for existing dependency
      const { data: existingDeps, error: checkError } = await supabase
        .from('task_dependencies')
        .select('*')
        .eq('task_id', taskId)
        .eq('dependency_task_id', dependencyTaskId);
        
      if (checkError) throw checkError;
      
      if (existingDeps && existingDeps.length > 0) {
        return { success: false, error: 'التبعية موجودة بالفعل' };
      }
      
      // Add the dependency
      const { error: insertError } = await supabase
        .from('task_dependencies')
        .insert({
          task_id: taskId,
          dependency_task_id: dependencyTaskId,
          dependency_type: dependencyType
        });
        
      if (insertError) throw insertError;
      
      // Refresh dependencies
      await fetchDependencies();
      
      return { success: true, error: null };
    } catch (error: any) {
      console.error('Error adding task dependency:', error);
      return { 
        success: false, 
        error: error.message || 'حدث خطأ أثناء إضافة التبعية'
      };
    }
  }, [taskId, fetchDependencies]);

  // Remove a dependency
  const removeDependency = useCallback(async (dependencyId: string) => {
    try {
      const { error } = await supabase
        .from('task_dependencies')
        .delete()
        .eq('id', dependencyId);
        
      if (error) throw error;
      
      // Refresh dependencies
      await fetchDependencies();
      
      return { success: true, error: null };
    } catch (error: any) {
      console.error('Error removing task dependency:', error);
      return { 
        success: false, 
        error: error.message || 'حدث خطأ أثناء حذف التبعية'
      };
    }
  }, [fetchDependencies]);

  // Fetch dependencies on mount and when taskId changes
  useEffect(() => {
    fetchDependencies();
  }, [taskId, fetchDependencies]);

  return {
    isLoading,
    isBlockedByDependencies,
    blockedByDependencies,
    blockingDependencies,
    relatedDependencies,
    dependencyCounts,
    fetchDependencies,
    addDependency,
    removeDependency,
    checkDependencyStatus,
    detectCircularDependencies
  };
}
