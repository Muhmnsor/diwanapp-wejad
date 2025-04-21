
import { useState } from "react";
import { useTaskDependencies } from "../../project-details/hooks/useTaskDependencies";
import { supabase } from "@/integrations/supabase/client";

interface TaskDependencyManagerProps {
  taskId: string;
}

export const useTaskDependencyManager = ({ taskId }: TaskDependencyManagerProps) => {
  const [showDependencies, setShowDependencies] = useState(false);
  const { dependencies, dependentTasks, checkDependenciesCompleted } = useTaskDependencies(taskId);
  
  const hasDependencies = dependencies.length > 0;
  const hasDependents = dependentTasks.length > 0;
  const hasPendingDependencies = hasDependencies && dependencies.some(d => d.status !== 'completed');

  const dependencyIconColor = hasPendingDependencies
    ? 'text-amber-500'
    : hasDependencies
      ? 'text-green-500'
      : hasDependents
        ? 'text-blue-500'
        : 'text-gray-500';

  return {
    showDependencies,
    setShowDependencies,
    hasDependencies,
    hasDependents,
    hasPendingDependencies,
    dependencyIconColor,
    checkDependenciesCompleted
  };
};

export const checkDependenciesCompleted = async (taskId: string) => {
  try {
    // Fetch task dependencies
    const { data: dependencies, error: depError } = await supabase
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

    if (depError) {
      console.error("Error fetching dependencies:", depError);
      return { 
        isValid: false, 
        message: "تعذر التحقق من اعتماديات المهمة",
        pendingDependencies: [] 
      };
    }

    // No dependencies found, task can be completed
    if (!dependencies || dependencies.length === 0) {
      return { 
        isValid: true, 
        message: "",
        pendingDependencies: [] 
      };
    }

    // Check if any dependency tasks are not completed
    const pendingDependencies = dependencies
      .filter(dep => dep.tasks?.status !== 'completed')
      .map(dep => dep.tasks);

    if (pendingDependencies.length > 0) {
      return {
        isValid: false,
        message: "لا يمكن إكمال المهمة حتى يتم إكمال جميع المهام المعتمدة عليها",
        pendingDependencies
      };
    }

    return { 
      isValid: true, 
      message: "",
      pendingDependencies: [] 
    };
  } catch (error) {
    console.error("Error checking dependencies:", error);
    return { 
      isValid: false, 
      message: "حدث خطأ أثناء التحقق من اعتماديات المهمة",
      pendingDependencies: [] 
    };
  }
};
