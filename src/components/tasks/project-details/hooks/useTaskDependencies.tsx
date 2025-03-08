
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "../types/task";
import { toast } from "sonner";

export interface DependencyType {
  id: string;
  task_id: string;
  dependency_task_id: string;
  dependency_type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';
  created_at: string;
}

export const useTaskDependencies = (taskId: string | undefined) => {
  const [dependencies, setDependencies] = useState<Task[]>([]);
  const [dependentTasks, setDependentTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [rawDependencies, setRawDependencies] = useState<DependencyType[]>([]);

  const fetchDependencies = async () => {
    if (!taskId) return;
    
    setIsLoading(true);
    try {
      console.log("Fetching dependencies for task:", taskId);
      
      // Fetch raw dependencies from task_dependencies
      const { data: dependenciesData, error: dependenciesError } = await supabase
        .from('task_dependencies')
        .select('*')
        .eq('task_id', taskId);
      
      if (dependenciesError) throw dependenciesError;
      console.log("Raw dependencies data:", dependenciesData);
      setRawDependencies(dependenciesData || []);
      
      // Fetch dependent tasks (tasks that depend on this task)
      const { data: dependentData, error: dependentError } = await supabase
        .from('task_dependencies')
        .select('*')
        .eq('dependency_task_id', taskId);
      
      if (dependentError) throw dependentError;
      console.log("Raw dependent tasks data:", dependentData);
      
      // Fetch actual task data for dependencies
      if (dependenciesData && dependenciesData.length > 0) {
        const dependencyIds = dependenciesData.map(dep => dep.dependency_task_id);
        
        const { data: taskData, error: taskError } = await supabase
          .from('tasks')
          .select('*')
          .in('id', dependencyIds);
        
        if (taskError) throw taskError;
        console.log("Task data for dependencies:", taskData);
        
        // Cast the task data to match the Task interface
        const typedTasks: Task[] = (taskData || []).map(task => ({
          id: task.id,
          title: task.title,
          description: task.description || null,
          status: task.status || 'pending',
          priority: task.priority || null,
          due_date: task.due_date || null,
          assigned_to: task.assigned_to || null,
          created_at: task.created_at || new Date().toISOString(),
          stage_id: task.stage_id || undefined,
          stage_name: task.stage_name
        }));
        
        setDependencies(typedTasks);
      } else {
        setDependencies([]);
      }
      
      // Fetch actual task data for dependent tasks
      if (dependentData && dependentData.length > 0) {
        const dependentIds = dependentData.map(dep => dep.task_id);
        
        const { data: taskData, error: taskError } = await supabase
          .from('tasks')
          .select('*')
          .in('id', dependentIds);
        
        if (taskError) throw taskError;
        console.log("Task data for dependent tasks:", taskData);
        
        // Cast the task data to match the Task interface
        const typedTasks: Task[] = (taskData || []).map(task => ({
          id: task.id,
          title: task.title,
          description: task.description || null,
          status: task.status || 'pending',
          priority: task.priority || null,
          due_date: task.due_date || null,
          assigned_to: task.assigned_to || null,
          created_at: task.created_at || new Date().toISOString(),
          stage_id: task.stage_id || undefined,
          stage_name: task.stage_name
        }));
        
        setDependentTasks(typedTasks);
      } else {
        setDependentTasks([]);
      }
    } catch (error) {
      console.error("Error fetching task dependencies:", error);
      toast.error("حدث خطأ أثناء جلب اعتماديات المهمة");
    } finally {
      setIsLoading(false);
    }
  };

  // Add dependency between tasks
  const addDependency = async (dependencyTaskId: string, dependencyType: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish' = 'finish-to-start') => {
    if (!taskId || !dependencyTaskId) return;
    
    try {
      console.log(`Adding dependency: Task ${taskId} depends on ${dependencyTaskId}`);
      
      // Check for circular dependency
      const result = await checkCircularDependency(taskId, dependencyTaskId);
      if (result.isCircular) {
        toast.error("لا يمكن إضافة اعتمادية دائرية بين المهام");
        return false;
      }
      
      const { data, error } = await supabase
        .from('task_dependencies')
        .insert({
          task_id: taskId,
          dependency_task_id: dependencyTaskId,
          dependency_type: dependencyType
        })
        .select();
      
      if (error) {
        console.error("Error in addDependency:", error);
        throw error;
      }
      
      console.log("Dependency added successfully:", data);
      toast.success("تمت إضافة الاعتمادية بنجاح");
      await fetchDependencies();
      return true;
    } catch (error) {
      console.error("Error adding task dependency:", error);
      toast.error("حدث خطأ أثناء إضافة اعتمادية المهمة");
      return false;
    }
  };

  // Remove dependency between tasks
  const removeDependency = async (dependencyTaskId: string) => {
    if (!taskId || !dependencyTaskId) return;
    
    try {
      console.log(`Removing dependency: Task ${taskId} no longer depends on ${dependencyTaskId}`);
      
      const { error } = await supabase
        .from('task_dependencies')
        .delete()
        .match({
          task_id: taskId,
          dependency_task_id: dependencyTaskId
        });
      
      if (error) throw error;
      
      toast.success("تمت إزالة الاعتمادية بنجاح");
      await fetchDependencies();
      return true;
    } catch (error) {
      console.error("Error removing task dependency:", error);
      toast.error("حدث خطأ أثناء إزالة اعتمادية المهمة");
      return false;
    }
  };

  // Check if dependencies for a task are completed
  const checkDependenciesCompleted = async (taskId: string): Promise<{ 
    isValid: boolean; 
    message: string; 
    pendingDependencies: Task[] 
  }> => {
    try {
      // Fetch dependencies
      const { data: dependencies, error } = await supabase
        .from('task_dependencies')
        .select('dependency_task_id, dependency_type')
        .eq('task_id', taskId);
      
      if (error) throw error;
      
      if (!dependencies || dependencies.length === 0) {
        return { isValid: true, message: "", pendingDependencies: [] };
      }
      
      const dependencyIds = dependencies.map(dep => dep.dependency_task_id);
      
      // Get task data for dependencies
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('id, title, status')
        .in('id', dependencyIds);
      
      if (taskError) throw taskError;
      
      if (!taskData) {
        return { isValid: true, message: "", pendingDependencies: [] };
      }
      
      // Find incomplete dependencies and properly cast them to Task type
      const incompleteDependencies: Task[] = taskData
        .filter(task => task.status !== 'completed')
        .map(task => ({
          id: task.id,
          title: task.title,
          status: task.status || 'pending',
          description: null,
          priority: null,
          due_date: null,
          assigned_to: null,
          created_at: new Date().toISOString()
        }));
      
      if (incompleteDependencies.length > 0) {
        return {
          isValid: false,
          message: "لا يمكن إكمال هذه المهمة حتى تكتمل المهام التي تعتمد عليها",
          pendingDependencies: incompleteDependencies
        };
      }
      
      return { isValid: true, message: "", pendingDependencies: [] };
    } catch (error) {
      console.error("Error checking task dependencies:", error);
      return { 
        isValid: false, 
        message: "حدث خطأ أثناء التحقق من اعتماديات المهمة", 
        pendingDependencies: [] 
      };
    }
  };

  // Helper function to check for circular dependencies
  const checkCircularDependency = async (taskId: string, dependencyTaskId: string) => {
    // Simple check: don't allow direct circular dependencies
    if (taskId === dependencyTaskId) {
      return { isCircular: true, path: [taskId, dependencyTaskId] };
    }
    
    try {
      // Get all dependencies of the dependency task
      const visited = new Set<string>();
      const stack: string[] = [dependencyTaskId];
      
      while (stack.length > 0) {
        const currentTaskId = stack.pop()!;
        
        if (visited.has(currentTaskId)) continue;
        visited.add(currentTaskId);
        
        if (currentTaskId === taskId) {
          return { isCircular: true, path: [...visited] };
        }
        
        // Get dependencies of the current task
        const { data, error } = await supabase
          .from('task_dependencies')
          .select('dependency_task_id')
          .eq('task_id', currentTaskId);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          for (const dep of data) {
            stack.push(dep.dependency_task_id);
          }
        }
      }
      
      return { isCircular: false, path: [] };
    } catch (error) {
      console.error("Error checking circular dependency:", error);
      // If there's an error, prevent the dependency to be safe
      return { isCircular: true, path: [] };
    }
  };

  useEffect(() => {
    if (taskId) {
      fetchDependencies();
    }
  }, [taskId]);

  return {
    dependencies,
    dependentTasks,
    isLoading,
    rawDependencies,
    fetchDependencies,
    addDependency,
    removeDependency,
    checkDependenciesCompleted
  };
};
