
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/authStore";
import type { Task } from "@/components/tasks/types/task";

export const useDraftTasksVisibility = (tasks: Task[], projectId?: string) => {
  const [visibleTasks, setVisibleTasks] = useState<Task[]>([]);
  const [isProjectManager, setIsProjectManager] = useState(false);
  const [isDraftProject, setIsDraftProject] = useState(false);
  const { user } = useAuthStore();

  // Check if the current user is the project manager
  useEffect(() => {
    if (!projectId || !user?.id) return;

    const checkProjectManager = async () => {
      try {
        const { data, error } = await supabase
          .from('project_tasks')
          .select('project_manager, is_draft')
          .eq('id', projectId)
          .single();

        if (error) throw error;

        setIsProjectManager(data?.project_manager === user?.id);
        setIsDraftProject(!!data?.is_draft);
      } catch (err) {
        console.error("Error checking project manager:", err);
        setIsProjectManager(false);
      }
    };

    checkProjectManager();
  }, [projectId, user?.id]);

  // Filter tasks based on draft status and user role
  useEffect(() => {
    if (!tasks.length) {
      setVisibleTasks([]);
      return;
    }

    // If project is not in draft mode, show all tasks
    if (!isDraftProject) {
      setVisibleTasks(tasks);
      return;
    }

    // If user is project manager, show all tasks
    if (isProjectManager) {
      setVisibleTasks(tasks);
      return;
    }

    // For regular users, hide tasks in draft projects
    setVisibleTasks([]);
  }, [tasks, isDraftProject, isProjectManager]);

  return {
    visibleTasks,
    isProjectManager,
    isDraftProject
  };
};
