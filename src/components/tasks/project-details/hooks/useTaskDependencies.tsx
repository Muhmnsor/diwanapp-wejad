
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type DependencyType = 'blocks' | 'blocked_by' | 'relates_to' | 'finish-to-start' | 'start-to-start' | 'finish-to-finish';

export interface TaskDependency {
  id?: string;
  taskId: string;
  dependencyTaskId: string;
  dependencyType: DependencyType;
  title?: string; // Task title for display purposes
  status?: string; // Task status for dependency validation
}

export const useTaskDependencies = (taskId?: string) => {
  const [dependencies, setDependencies] = useState<TaskDependency[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  
  // Fetch dependencies for a task
  const fetchDependencies = useCallback(async () => {
    if (!taskId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get tasks that this task depends on (blocked by)
      const { data: blockedByData, error: blockedByError } = await supabase
        .from('task_dependencies')
        .select(`
          id,
          task_id,
          dependency_task_id,
          dependency_type,
          tasks!dependency_task_id (title, status)
        `)
        .eq('task_id', taskId);
        
      if (blockedByError) throw blockedByError;
      
      // Get tasks that depend on this task (blocks)
      const { data: blocksData, error: blocksError } = await supabase
        .from('task_dependencies')
        .select(`
          id,
          task_id,
          dependency_task_id,
          dependency_type,
          tasks!task_id (title, status)
        `)
        .eq('dependency_task_id', taskId);
        
      if (blocksError) throw blocksError;
      
      // Format the dependencies
      const formattedDependencies: TaskDependency[] = [
        ...(blockedByData || []).map(dep => ({
          id: dep.id,
          taskId: dep.task_id,
          dependencyTaskId: dep.dependency_task_id,
          dependencyType: dep.dependency_type as DependencyType,
          title: dep.tasks?.title,
          status: dep.tasks?.status
        })),
        ...(blocksData || []).map(dep => ({
          id: dep.id,
          taskId: dep.dependency_task_id,
          dependencyTaskId: dep.task_id,
          dependencyType: 'blocks' as DependencyType, // This task blocks another
          title: dep.tasks?.title,
          status: dep.tasks?.status
        }))
      ];
      
      setDependencies(formattedDependencies);
      
      // Check if any blocking dependencies are incomplete
      const isTaskBlocked = (blockedByData || []).some(dep => {
        if (dep.dependency_type === 'blocked_by') {
          return dep.tasks && dep.tasks.status !== 'completed';
        }
        
        if (dep.dependency_type === 'finish-to-start') {
          return dep.tasks && dep.tasks.status !== 'completed';
        }
        
        if (dep.dependency_type === 'start-to-start') {
          return dep.tasks && dep.tasks.status !== 'in_progress' && dep.tasks.status !== 'completed';
        }
        
        return false;
      });
      
      setIsBlocked(isTaskBlocked);
    } catch (err) {
      console.error("Error fetching task dependencies:", err);
      setError("Failed to load dependencies");
      setDependencies([]);
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);
  
  useEffect(() => {
    fetchDependencies();
  }, [fetchDependencies]);
  
  // Add a new dependency
  const addDependency = async (dependencyTaskId: string, dependencyType: DependencyType) => {
    if (!taskId) return { success: false, message: "No task ID provided" };
    
    try {
      // Set up the dependency record
      let record = {}; 
      
      // Map blocks to blocked_by for the other side of the relationship
      if (dependencyType === 'blocks') {
        record = {
          task_id: dependencyTaskId,
          dependency_task_id: taskId,
          dependency_type: 'blocked_by'
        };
      } else {
        record = {
          task_id: taskId,
          dependency_task_id: dependencyTaskId,
          dependency_type: dependencyType
        };
      }
      
      // Perform enhanced circular dependency check for all types except 'relates_to'
      if (dependencyType !== 'relates_to') {
        const circularCheck = await checkCircularDependencies(taskId, dependencyTaskId, dependencyType);
        if (circularCheck.isCircular) {
          return { success: false, message: circularCheck.message };
        }
      }
      
      // Insert the dependency
      const { error } = await supabase
        .from('task_dependencies')
        .insert(record);
        
      if (error) throw error;
      
      // Refresh dependencies
      await fetchDependencies();
      
      return { success: true, message: "Dependency added successfully" };
    } catch (err) {
      console.error("Error adding dependency:", err);
      return { success: false, message: "Failed to add dependency" };
    }
  };
  
  // Remove a dependency
  const removeDependency = async (dependencyId: string) => {
    try {
      const { error } = await supabase
        .from('task_dependencies')
        .delete()
        .eq('id', dependencyId);
        
      if (error) throw error;
      
      // Refresh dependencies
      await fetchDependencies();
      
      return { success: true, message: "Dependency removed successfully" };
    } catch (err) {
      console.error("Error removing dependency:", err);
      return { success: false, message: "Failed to remove dependency" };
    }
  };
  
  // Check if a status change is allowed based on dependencies
  const canChangeStatus = async (newStatus: string): Promise<{allowed: boolean, message?: string}> => {
    if (!taskId) return { allowed: true };
    
    // Always allow setting to pending
    if (newStatus === 'pending') return { allowed: true };
    
    // Check if there are any dependencies preventing status change
    await fetchDependencies();
    
    // If changing to completed, check all finish-to-start and blocked_by dependencies
    if (newStatus === 'completed') {
      const blockingDeps = dependencies.filter(dep => 
        (dep.dependencyType === 'blocked_by' || dep.dependencyType === 'finish-to-start') && 
        dep.status !== 'completed'
      );
      
      if (blockingDeps.length > 0) {
        const blockingTasks = blockingDeps.map(dep => dep.title || 'Unnamed task').join(', ');
        return { 
          allowed: false, 
          message: `لا يمكن إكمال هذه المهمة حتى اكتمال المهام التالية: ${blockingTasks}`
        };
      }
    }
    
    // If changing to in_progress, check all start-to-start dependencies
    if (newStatus === 'in_progress') {
      const blockingDeps = dependencies.filter(dep => 
        dep.dependencyType === 'start-to-start' && 
        dep.status !== 'in_progress' && 
        dep.status !== 'completed'
      );
      
      if (blockingDeps.length > 0) {
        const blockingTasks = blockingDeps.map(dep => dep.title || 'Unnamed task').join(', ');
        return { 
          allowed: false, 
          message: `لا يمكن بدء هذه المهمة حتى بدء المهام التالية: ${blockingTasks}`
        };
      }
    }
    
    // For finish-to-finish dependency
    if (newStatus === 'completed') {
      const finishToFinishDeps = dependencies.filter(dep => 
        dep.dependencyType === 'finish-to-finish' && 
        dep.status !== 'completed'
      );
      
      if (finishToFinishDeps.length > 0) {
        const blockingTasks = finishToFinishDeps.map(dep => dep.title || 'Unnamed task').join(', ');
        return { 
          allowed: false, 
          message: `لا يمكن إكمال هذه المهمة حتى إكمال المهام المرتبطة التالية: ${blockingTasks}`
        };
      }
    }
    
    return { allowed: true };
  };
  
  // Enhanced helper to check for circular dependencies using DFS
  const checkCircularDependencies = async (
    taskId: string, 
    dependencyTaskId: string,
    dependencyType: DependencyType
  ): Promise<{isCircular: boolean, message?: string}> => {
    try {
      // First level check - is task trying to depend on itself?
      if (taskId === dependencyTaskId) {
        return { 
          isCircular: true, 
          message: "لا يمكن للمهمة أن تعتمد على نفسها" 
        };
      }
      
      // Set to track visited tasks
      const visited = new Set<string>();
      
      // Depth-first search to detect cycles
      const detectCycle = async (currentTaskId: string, path: string[] = []): Promise<boolean> => {
        // If we've reached the original task, we have a cycle
        if (currentTaskId === taskId) {
          return true;
        }
        
        // If we've already visited this task in another path, skip it
        if (visited.has(currentTaskId)) {
          return false;
        }
        
        // Mark as visited
        visited.add(currentTaskId);
        path.push(currentTaskId);
        
        // Find all dependencies of the current task
        const { data: dependentOn } = await supabase
          .from('task_dependencies')
          .select('task_id, dependency_task_id, dependency_type')
          .or(`task_id.eq.${currentTaskId}`);
          
        if (dependentOn) {
          for (const dep of dependentOn) {
            // If target of dependency is only a "relates_to" relationship, skip it
            if (dep.dependency_type === 'relates_to') continue;
            
            // Check if this dependency continues the cycle
            const nextTaskId = dep.dependency_task_id;
            if (await detectCycle(nextTaskId, [...path])) {
              return true;
            }
          }
        }
        
        return false;
      };
      
      // Skip deep check for relates_to as it doesn't create dependencies
      if (dependencyType === 'relates_to') {
        return { isCircular: false };
      }
      
      // Start the DFS from the dependency task
      const isCyclic = await detectCycle(dependencyTaskId);
      
      if (isCyclic) {
        return { 
          isCircular: true, 
          message: "سيؤدي هذا إلى اعتمادية دائرية بين المهام"
        };
      }
      
      return { isCircular: false };
    } catch (err) {
      console.error("Error checking circular dependencies:", err);
      // Default to allowing in case of error, but log it
      return { isCircular: false }; 
    }
  };
  
  return {
    dependencies,
    isLoading,
    error,
    isBlocked,
    fetchDependencies,
    addDependency,
    removeDependency,
    canChangeStatus
  };
};
