
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
}

interface PortfolioWorkspace {
  name: string;
}

export const useAssignedTasks = () => {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['all-assigned-tasks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log('Fetching all assigned tasks for user:', user.id);
      
      try {
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
            portfolio_only_projects(name),
            portfolio_workspaces(name)
          `)
          .eq('assigned_to', user.id);
        
        if (portfolioError) {
          console.error("Error fetching portfolio tasks:", portfolioError);
          throw portfolioError;
        }
        
        // Format the portfolio tasks
        const formattedPortfolioTasks = (portfolioTasks || []).map(task => {
          // Safely access nested properties
          let projectName = 'مشروع غير محدد';
          if (task.portfolio_only_projects && 
              Array.isArray(task.portfolio_only_projects) && 
              task.portfolio_only_projects.length > 0 && 
              task.portfolio_only_projects[0].name) {
            projectName = task.portfolio_only_projects[0].name;
          }
          
          return {
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            due_date: task.due_date,
            priority: task.priority,
            project_name: projectName
          };
        });
        
        // Get tasks from the regular tasks table and join with projects to get project names
        const { data: regularTasks, error: tasksError } = await supabase
          .from('tasks')
          .select(`
            id,
            title,
            description,
            status,
            due_date,
            priority,
            project_id,
            projects(title)
          `)
          .eq('assigned_to', user.id);
        
        if (tasksError) {
          console.error("Error fetching tasks:", tasksError);
          throw tasksError;
        }
        
        // Format the regular tasks
        const formattedRegularTasks = (regularTasks || []).map(task => {
          // Get project name from the joined projects table or use default text
          let projectName = 'غير مرتبط بمشروع';
          if (task.projects && task.projects.title) {
            projectName = task.projects.title;
          }
          
          return {
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status as TaskStatus,
            due_date: task.due_date,
            priority: task.priority,
            project_name: projectName
          };
        });
        
        // Combine both types of tasks
        const allTasks = [...formattedPortfolioTasks, ...formattedRegularTasks];
        
        console.log('All assigned tasks:', allTasks);
        return allTasks;
      } catch (error) {
        console.error("Error in useAssignedTasks:", error);
        throw error;
      }
    },
    enabled: !!user?.id
  });
};
