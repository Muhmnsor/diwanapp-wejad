
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/authStore";

export const useProjectPermissions = (projectId?: string) => {
  const [isProjectManager, setIsProjectManager] = useState(false);
  const [isDraftProject, setIsDraftProject] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!projectId || !user?.id) {
      setIsLoading(false);
      return;
    }

    const checkProjectPermissions = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('project_tasks')
          .select('project_manager, is_draft')
          .eq('id', projectId)
          .single();

        if (error) throw error;

        // Check if user is project manager
        const userIsManager = data?.project_manager === user?.id;
        setIsProjectManager(userIsManager);
        setIsDraftProject(!!data?.is_draft);
        
        console.log(`Project Permissions - User: ${user.id}, Is Manager: ${userIsManager}, Is Draft: ${!!data?.is_draft}`);
      } catch (err) {
        console.error("Error checking project permissions:", err);
        setIsProjectManager(false);
        setIsDraftProject(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkProjectPermissions();
  }, [projectId, user?.id]);

  // Check if user can see draft tasks
  const canViewDraftTasks = () => {
    // Admin or project manager can always see draft tasks
    if (user?.isAdmin || user?.role === 'admin' || isProjectManager) {
      return true;
    }
    return false;
  };

  // Check if user can launch the project (change from draft to published)
  const canLaunchProject = () => {
    return isProjectManager || user?.isAdmin || user?.role === 'admin';
  };

  return {
    isProjectManager,
    isDraftProject,
    isLoading,
    canViewDraftTasks,
    canLaunchProject
  };
};
