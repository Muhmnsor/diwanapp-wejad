
import { useEffect, useState } from "react";
import { useProjectPermissions } from "./useProjectPermissions";
import type { Task } from "@/components/tasks/types/task";

export const useDraftTasksVisibility = (tasks: Task[], projectId?: string) => {
  const [visibleTasks, setVisibleTasks] = useState<Task[]>([]);
  const { 
    isProjectManager, 
    isDraftProject, 
    isLoading: isLoadingPermissions,
    canViewDraftTasks 
  } = useProjectPermissions(projectId);

  // Filter tasks based on draft status and user role
  useEffect(() => {
    if (isLoadingPermissions) return;
    
    if (!tasks || !tasks.length) {
      setVisibleTasks([]);
      return;
    }

    console.log(`Task Visibility - Tasks: ${tasks.length}, Is Draft: ${isDraftProject}, Is Manager: ${isProjectManager}`);

    // If project is not in draft mode or user has permission, show all tasks
    if (!isDraftProject || canViewDraftTasks()) {
      setVisibleTasks(tasks);
      return;
    }

    // For regular users, hide tasks in draft projects
    setVisibleTasks([]);
  }, [tasks, isDraftProject, isProjectManager, isLoadingPermissions, canViewDraftTasks]);

  return {
    visibleTasks,
    isProjectManager,
    isDraftProject,
    isLoadingVisibility: isLoadingPermissions
  };
};
