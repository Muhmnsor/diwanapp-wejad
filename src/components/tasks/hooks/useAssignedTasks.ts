
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/refactored-auth";

export type TaskStatus = 'pending' | 'completed' | 'delayed' | 'upcoming';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  due_date: string | null;
  priority: string;
  project_name?: string;
  workspace_name?: string;
}

// Define types for the nested Supabase response
interface PortfolioProject {
  portfolio_only_projects: {
    name: string;
  }[];
}

interface PortfolioTaskResponse {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  due_date: string | null;
  priority: string;
  portfolio_projects: PortfolioProject | null;
  portfolio_workspaces: {
    name: string;
  } | null;
}

export const useAssignedTasks = () => {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['all-assigned-tasks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log('Fetching all assigned tasks for user:', user.id);
      
      // Fetch tasks from portfolio_tasks table
      const { data: portfolioTasks, error: portfolioError } = await supabase
        .from('portfolio_tasks')
        .select(`
          id,
          title,
          description,
          status,
          due_date,
          priority,
          project_id,
          workspace_id,
          portfolio_projects(portfolio_only_projects(name)),
          portfolio_workspaces(name)
        `)
        .eq('assigned_to', user.id);
      
      if (portfolioError) {
        console.error("Error fetching portfolio tasks:", portfolioError);
        throw portfolioError;
      }
      
      // Format the portfolio tasks with proper type checking
      const formattedPortfolioTasks = (portfolioTasks as PortfolioTaskResponse[] || []).map(task => {
        // Safely access nested properties with proper type checking
        const projectName = task.portfolio_projects?.portfolio_only_projects?.[0]?.name || 'مشروع غير محدد';
        const workspaceName = task.portfolio_workspaces?.name || 'مساحة غير محددة';
        
        return {
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          due_date: task.due_date,
          priority: task.priority,
          project_name: projectName,
          workspace_name: workspaceName
        };
      });
      
      // Get tasks from the regular tasks table
      const { data: regularTasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_to', user.id);
      
      if (tasksError) {
        console.error("Error fetching tasks:", tasksError);
        throw tasksError;
      }
      
      // Format the regular tasks
      const formattedRegularTasks = (regularTasks || []).map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status as TaskStatus,
        due_date: task.due_date,
        priority: task.priority,
        project_name: task.project_id || 'غير مرتبط بمشروع',
        workspace_name: task.workspace_id || 'غير مرتبط بمساحة'
      }));
      
      // Combine both types of tasks
      const allTasks = [...formattedPortfolioTasks, ...formattedRegularTasks];
      
      console.log('All assigned tasks:', allTasks);
      return allTasks;
    },
    enabled: !!user?.id
  });
};
