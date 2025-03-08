
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Task } from "../types/task";
import {
  fetchRawDependencies,
  fetchRawDependentTasks,
  fetchTasksData,
  addTaskDependency,
  removeTaskDependency,
  checkCircularDependency,
  fetchAvailableTasks
} from "./useTaskDependencies.service";

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
      // Fetch raw dependencies and dependent tasks
      const dependenciesData = await fetchRawDependencies(taskId);
      setRawDependencies(dependenciesData);
      
      const dependentData = await fetchRawDependentTasks(taskId);
      
      // Fetch actual task data for dependencies
      if (dependenciesData.length > 0) {
        const dependencyIds = dependenciesData.map(dep => dep.dependency_task_id);
        const taskData = await fetchTasksData(dependencyIds);
        setDependencies(taskData);
      } else {
        setDependencies([]);
      }
      
      // Fetch actual task data for dependent tasks
      if (dependentData.length > 0) {
        const dependentIds = dependentData.map(dep => dep.task_id);
        const taskData = await fetchTasksData(dependentIds);
        setDependentTasks(taskData);
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
  const addDependency = async (
    dependencyTaskId: string, 
    dependencyType: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish' = 'finish-to-start'
  ) => {
    if (!taskId || !dependencyTaskId) {
      console.error("Missing taskId or dependencyTaskId", { taskId, dependencyTaskId });
      return false;
    }
    
    try {
      // Check for circular dependency
      const result = await checkCircularDependency(taskId, dependencyTaskId);
      if (result.isCircular) {
        toast.error("لا يمكن إضافة اعتمادية دائرية بين المهام");
        return false;
      }
      
      // Make sure we don't create duplicate dependencies
      const existingDependency = rawDependencies.find(
        d => d.dependency_task_id === dependencyTaskId
      );
      
      if (existingDependency) {
        console.log("Dependency already exists:", existingDependency);
        toast.error("هذه الاعتمادية موجودة بالفعل");
        return false;
      }
      
      await addTaskDependency(taskId, dependencyTaskId, dependencyType);
      
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
    if (!taskId || !dependencyTaskId) {
      console.error("Missing taskId or dependencyTaskId", { taskId, dependencyTaskId });
      return false;
    }
    
    try {
      await removeTaskDependency(taskId, dependencyTaskId);
      
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
  const checkDependenciesCompleted = async (taskId: string) => {
    try {
      // Fetch dependencies for the task
      const dependenciesData = await fetchRawDependencies(taskId);
      
      if (!dependenciesData || dependenciesData.length === 0) {
        return { isValid: true, message: "", pendingDependencies: [] };
      }
      
      const dependencyIds = dependenciesData.map(dep => dep.dependency_task_id);
      const taskData = await fetchTasksData(dependencyIds);
      
      // Find incomplete dependencies
      const incompleteDependencies = taskData.filter(task => task.status !== 'completed');
      
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
