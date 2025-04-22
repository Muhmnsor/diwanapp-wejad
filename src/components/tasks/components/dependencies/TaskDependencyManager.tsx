
import { useState } from "react";
import { useTaskDependencies } from "../../project-details/hooks/useTaskDependencies";

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
    dependencyIconColor
  };
};
