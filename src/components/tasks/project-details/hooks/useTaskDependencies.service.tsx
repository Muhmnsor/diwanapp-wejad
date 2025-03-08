
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Task } from "../types/task";
import { DependencyType, DependencyData } from "../types/dependency";

// Fetch raw dependencies data from the task_dependencies table
export const fetchRawDependencies = async (taskId: string): Promise<DependencyData[]> => {
  console.log("Fetching raw dependencies for task:", taskId);
  
  const { data, error } = await supabase
    .from('task_dependencies')
    .select('*')
    .eq('task_id', taskId);
    
  if (error) {
    console.error("Error fetching raw dependencies:", error);
    throw error;
  }
  
  console.log("Raw dependencies data:", data);
  return data || [];
};

// Fetch raw dependent tasks data from the task_dependencies table
export const fetchRawDependentTasks = async (taskId: string): Promise<DependencyData[]> => {
  console.log("Fetching raw dependent tasks for task:", taskId);
  
  const { data, error } = await supabase
    .from('task_dependencies')
    .select('*')
    .eq('dependency_task_id', taskId);
    
  if (error) {
    console.error("Error fetching raw dependent tasks:", error);
    throw error;
  }
  
  console.log("Raw dependent tasks data:", data);
  return data || [];
};

// Fetch task data for a list of task IDs
export const fetchTasksData = async (taskIds: string[], rawDependenciesMap?: Record<string, any>): Promise<Task[]> => {
  if (!taskIds.length) return [];
  
  console.log("Fetching tasks data for IDs:", taskIds);
  
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .in('id', taskIds);
    
  if (error) {
    console.error("Error fetching tasks data:", error);
    throw error;
  }
  
  console.log("Tasks data:", data);
  
  // Cast the task data to match the Task interface
  return (data || []).map(task => {
    // Find the dependency type for this task if rawDependenciesMap is provided
    const dependency_type = rawDependenciesMap && rawDependenciesMap[task.id] 
      ? rawDependenciesMap[task.id].dependency_type 
      : undefined;
    
    return {
      id: task.id,
      title: task.title,
      description: task.description || null,
      status: task.status || 'pending',
      priority: task.priority || null,
      due_date: task.due_date || null,
      assigned_to: task.assigned_to || null,
      created_at: task.created_at || new Date().toISOString(),
      stage_id: task.stage_id || undefined,
      stage_name: task.stage_name,
      dependency_type: dependency_type
    };
  });
};

// Add a dependency between tasks
export const addTaskDependency = async (
  taskId: string, 
  dependencyTaskId: string, 
  dependencyType: DependencyType = 'finish-to-start'
) => {
  console.log(`Adding dependency: Task ${taskId} depends on ${dependencyTaskId} with type ${dependencyType}`);
  
  const { data, error } = await supabase
    .from('task_dependencies')
    .insert({
      task_id: taskId,
      dependency_task_id: dependencyTaskId,
      dependency_type: dependencyType
    })
    .select();
  
  if (error) {
    console.error("Error adding dependency:", error);
    throw error;
  }
  
  console.log("Dependency added successfully:", data);
  return data;
};

// Remove a dependency between tasks
export const removeTaskDependency = async (taskId: string, dependencyTaskId: string) => {
  console.log(`Removing dependency: Task ${taskId} no longer depends on ${dependencyTaskId}`);
  
  const { error } = await supabase
    .from('task_dependencies')
    .delete()
    .match({
      task_id: taskId,
      dependency_task_id: dependencyTaskId
    });
  
  if (error) {
    console.error("Error removing dependency:", error);
    throw error;
  }
  
  console.log("Dependency removed successfully");
  return true;
};

// Fetch available tasks for a project that can be dependencies
export const fetchAvailableTasks = async (projectId: string, taskId: string, dependencies: Task[]) => {
  console.log(`Fetching available tasks for project: ${projectId}, task: ${taskId}`);
  
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .filter('project_id', 'eq', projectId)
    .neq('id', taskId);
  
  if (error) {
    console.error("Error fetching available tasks:", error);
    throw error;
  }
  
  console.log(`Fetched ${data?.length || 0} tasks for project`);
  
  if (!data || data.length === 0) {
    return [];
  }
  
  // Filter out tasks that are already dependencies
  const dependencyIds = dependencies.map(d => d.id);
  const filteredTasks = data.filter(t => !dependencyIds.includes(t.id));
  
  console.log("Tasks after filtering out dependencies:", filteredTasks);
  return filteredTasks;
};

// Check for circular dependencies
export const checkCircularDependency = async (taskId: string, dependencyTaskId: string) => {
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
      
      if (error) {
        console.error("Error checking circular dependency:", error);
        throw error;
      }
      
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
