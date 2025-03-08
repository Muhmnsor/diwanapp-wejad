
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Workspace } from "@/types/workspace";

export const useWorkspaceDetails = (workspaceId: string | undefined) => {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchWorkspaceDetails = async () => {
      if (!workspaceId) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        console.log("Fetching workspace details for ID:", workspaceId);
        
        // First try to fetch from portfolio_workspaces
        const { data: portfolioData, error: portfolioError } = await supabase
          .from('portfolio_workspaces')
          .select('*')
          .eq('id', workspaceId)
          .single();
          
        if (!portfolioError && portfolioData) {
          console.log("Workspace found in portfolio_workspaces:", portfolioData);
          
          // Get task counts
          const { data: tasksData } = await supabase
            .from('tasks')
            .select('id, status')
            .eq('workspace_id', workspaceId);
            
          const totalTasks = tasksData?.length || 0;
          const completedTasks = tasksData?.filter(task => task.status === 'completed')?.length || 0;
          
          // Get members count
          const { data: membersData } = await supabase
            .from('workspace_members')
            .select('id')
            .eq('workspace_id', workspaceId);
            
          setWorkspace({
            ...portfolioData,
            total_tasks: totalTasks,
            completed_tasks: completedTasks,
            pending_tasks: totalTasks - completedTasks,
            members_count: membersData?.length || 0
          });
          return;
        }
        
        // If not found, try workspaces table
        const { data: workspaceData, error: workspaceError } = await supabase
          .from('workspaces')
          .select('*')
          .eq('id', workspaceId)
          .single();
          
        if (workspaceError) {
          console.error("Error fetching workspace:", workspaceError);
          throw workspaceError;
        }
        
        if (workspaceData) {
          console.log("Workspace found in workspaces:", workspaceData);
          
          // Get task counts
          const { data: tasksData } = await supabase
            .from('tasks')
            .select('id, status')
            .eq('workspace_id', workspaceId);
            
          const totalTasks = tasksData?.length || 0;
          const completedTasks = tasksData?.filter(task => task.status === 'completed')?.length || 0;
          
          // Get members count
          const { data: membersData } = await supabase
            .from('workspace_members')
            .select('id')
            .eq('workspace_id', workspaceId);
            
          setWorkspace({
            ...workspaceData,
            total_tasks: totalTasks,
            completed_tasks: completedTasks,
            pending_tasks: totalTasks - completedTasks,
            members_count: membersData?.length || 0
          });
        }
      } catch (err) {
        console.error("Error fetching workspace details:", err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWorkspaceDetails();
  }, [workspaceId]);
  
  return {
    workspace,
    isLoading,
    error
  };
};
