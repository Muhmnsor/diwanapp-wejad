
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
              task.portfolio_only_projects[0]?.name) {
            projectName = task.portfolio_only_projects[0].name;
          }
          
          // Also get workspace name if available
          let workspaceName = '';
          if (task.portfolio_workspaces && 
              Array.isArray(task.portfolio_workspaces) && 
              task.portfolio_workspaces.length > 0 && 
              task.portfolio_workspaces[0]?.name) {
            workspaceName = task.portfolio_workspaces[0].name;
          }
          
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
        
        // Get tasks from the regular tasks table and add project names
        // تغيير طريقة الاستعلام لأن هناك مشكلة في العلاقة بين tasks و projects
        const { data: regularTasks, error: tasksError } = await supabase
          .from('tasks')
          .select(`
            id,
            title,
            description,
            status,
            due_date,
            priority,
            project_id
          `)
          .eq('assigned_to', user.id);
        
        if (tasksError) {
          console.error("Error fetching tasks:", tasksError);
          throw tasksError;
        }
        
        // Format the regular tasks
        const formattedRegularTasks = (regularTasks || []).map(task => {
          return {
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status as TaskStatus,
            due_date: task.due_date,
            priority: task.priority,
            project_name: 'غير مرتبط بمشروع', // استخدام قيمة افتراضية
            workspace_name: 'مساحة عمل افتراضية' // قيمة افتراضية لمساحة العمل
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
