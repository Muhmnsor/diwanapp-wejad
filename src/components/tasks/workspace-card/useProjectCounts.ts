
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProjectCounts {
  completed: number;
  pending: number;
  stopped: number;
  stalled: number;
  total: number;
}

export const useProjectCounts = (workspaceId: string) => {
  const [projectCounts, setProjectCounts] = useState<ProjectCounts>({
    completed: 0,
    pending: 0,
    stopped: 0,
    stalled: 0,
    total: 0
  });

  useEffect(() => {
    const fetchProjectCounts = async () => {
      try {
        const { data: projects, error } = await supabase
          .from('project_tasks')
          .select('status')
          .eq('workspace_id', workspaceId);

        if (error) {
          console.error('Error fetching projects:', error);
          return;
        }

        const total = projects?.length || 0;
        const completed = projects?.filter(p => p.status === 'completed').length || 0;
        const pending = projects?.filter(p => 
          p.status === 'in_progress' || p.status === 'pending'
        ).length || 0;
        const stopped = projects?.filter(p => p.status === 'stopped' || p.status === 'on_hold').length || 0;
        const stalled = total - completed - pending - stopped;

        setProjectCounts({
          completed,
          pending,
          stopped,
          stalled,
          total
        });
      } catch (error) {
        console.error('Failed to fetch project counts:', error);
      }
    };

    fetchProjectCounts();
  }, [workspaceId]);

  return projectCounts;
};
