
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type DependencyType = 'blocks' | 'blocked_by' | 'relates_to' | 'finish-to-start' | 'start-to-start' | 'finish-to-finish';

export interface TaskDependency {
  id?: string;
  taskId: string;
  dependencyTaskId: string;
  dependencyType: DependencyType;
  title?: string; // Task title for display purposes
}

export const useTaskDependencies = (taskId?: string) => {
  const [dependencies, setDependencies] = useState<TaskDependency[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  
  // Fetch dependencies for a task
  const fetchDependencies = async () => {
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
          title: dep.tasks?.title
        })),
        ...(blocksData || []).map(dep => ({
          id: dep.id,
          taskId: dep.dependency_task_id,
          dependencyTaskId: dep.task_id,
          dependencyType: 'blocks' as DependencyType, // This task blocks another
          title: dep.tasks?.title
        }))
      ];
      
      setDependencies(formattedDependencies);
      
      // Check if any blocking dependencies are incomplete
      const isTaskBlocked = (blockedByData || []).some(dep => 
        dep.dependency_type === 'blocked_by' || 
        ((dep.dependency_type === 'finish-to-start' || dep.dependency_type === 'start-to-start') && 
        dep.tasks && dep.tasks.status !== 'completed')
      );
      
      setIsBlocked(isTaskBlocked);
    } catch (err) {
      console.error("Error fetching task dependencies:", err);
      setError("Failed to load dependencies");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Check for circular dependencies
  const checkCircularDependency = async (dependencyTaskId: string, dependencyType: DependencyType): Promise<boolean> => {
    if (!taskId || (dependencyType !== 'blocked_by' && dependencyType !== 'finish-to-start')) return false;
    
    // Direct circular check (A depends on B, B depends on A)
    const { data: directCheck } = await supabase
      .from('task_dependencies')
      .select('id')
      .eq('task_id', dependencyTaskId)
      .eq('dependency_task_id', taskId)
      .eq('dependency_type', dependencyType);
      
    if (directCheck && directCheck.length > 0) {
      return true; // Direct circular dependency detected
    }
    
    // Recursive check for indirect circular dependencies
    async function checkDependencyChain(currentTaskId: string, visitedTasks: Set<string> = new Set()): Promise<boolean> {
      if (visitedTasks.has(currentTaskId)) {
        return true; // Circular dependency detected
      }
      
      visitedTasks.add(currentTaskId);
      
      const { data: dependencies } = await supabase
        .from('task_dependencies')
        .select('dependency_task_id')
        .eq('task_id', currentTaskId)
        .in('dependency_type', ['blocked_by', 'finish-to-start', 'start-to-start']);
        
      if (!dependencies || dependencies.length === 0) {
        return false;
      }
      
      for (const dep of dependencies) {
        if (dep.dependency_task_id === taskId) {
          return true; // This would create a circular dependency
        }
        
        const result = await checkDependencyChain(dep.dependency_task_id, new Set(visitedTasks));
        if (result) {
          return true;
        }
      }
      
      return false;
    }
    
    return await checkDependencyChain(dependencyTaskId);
  };
  
  // Add a new dependency
  const addDependency = async (dependencyTaskId: string, dependencyType: DependencyType) => {
    if (!taskId) return { success: false, error: "No task ID provided" };
    
    try {
      // Check for circular dependencies for blockers
      if (dependencyType === 'blocked_by' || dependencyType === 'finish-to-start' || dependencyType === 'start-to-start') {
        const hasCircular = await checkCircularDependency(dependencyTaskId, dependencyType);
        if (hasCircular) {
          return { 
            success: false, 
            error: "لا يمكن إنشاء اعتمادية دائرية. هذا سيؤدي إلى تعليق المهام بشكل دائم." 
          };
        }
      }
      
      // Insert the dependency
      const { data, error } = await supabase
        .from('task_dependencies')
        .insert({
          task_id: taskId,
          dependency_task_id: dependencyTaskId,
          dependency_type: dependencyType
        })
        .select();
        
      if (error) throw error;
      
      await fetchDependencies();
      return { success: true, data };
    } catch (err) {
      console.error("Error adding dependency:", err);
      return { success: false, error: err };
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
      
      await fetchDependencies();
      return { success: true };
    } catch (err) {
      console.error("Error removing dependency:", err);
      return { success: false, error: err };
    }
  };
  
  // Check if status change is allowed based on dependencies
  const canChangeStatus = async (newStatus: string): Promise<{allowed: boolean, message?: string}> => {
    if (!taskId) return { allowed: true };
    
    // Only applies when changing to completed
    if (newStatus !== 'completed') return { allowed: true };
    
    try {
      // Check if task has any blocking dependencies
      const { data: blockingDeps, error } = await supabase
        .from('task_dependencies')
        .select(`
          dependency_task_id, 
          dependency_type,
          tasks:dependency_task_id(status, title)
        `)
        .eq('task_id', taskId)
        .in('dependency_type', ['blocked_by', 'finish-to-start', 'start-to-start']);
        
      if (error) throw error;
      
      const blockedBy = (blockingDeps || []).filter(dep => 
        dep.tasks && dep.tasks.status !== 'completed' && 
        (dep.dependency_type === 'blocked_by' || dep.dependency_type === 'finish-to-start')
      );
      
      if (blockedBy.length > 0) {
        // Get the names of the blocking tasks for better user feedback
        const blockingTaskNames = blockedBy.map(dep => dep.tasks?.title || 'مهمة غير معروفة').join(', ');
        
        return { 
          allowed: false, 
          message: `هذه المهمة معتمدة على ${blockedBy.length} مهام غير مكتملة: ${blockingTaskNames}` 
        };
      }
      
      return { allowed: true };
    } catch (err) {
      console.error("Error checking task dependencies:", err);
      return { allowed: true }; // Allow in case of error, but log it
    }
  };
  
  // Load dependencies when task ID changes
  useEffect(() => {
    if (taskId) {
      fetchDependencies();
    } else {
      setDependencies([]);
      setIsBlocked(false);
    }
  }, [taskId]);
  
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
