
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/refactored-auth";

export type TaskStatus = 'pending' | 'completed' | 'delayed' | 'upcoming' | 'in_progress';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  due_date: string | null;
  priority: string;
  project_name?: string;
  workspace_name?: string;
  project_id?: string;
  is_subtask?: boolean;
  parent_task_id?: string;
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
            workspace_name: workspaceName,
            is_subtask: false
          };
        });
        
        // Get tasks from the regular tasks table
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
        
        // Get project details for regular tasks
        const projectIds = regularTasks
          ?.filter(task => task.project_id)
          .map(task => task.project_id) || [];
        
        let projectsMap = {};
        
        if (projectIds.length > 0) {
          // First try to fetch from project_tasks table
          const { data: projectTasksData } = await supabase
            .from('project_tasks')
            .select('id, title')
            .in('id', projectIds);
            
          if (projectTasksData && projectTasksData.length > 0) {
            projectTasksData.forEach(project => {
              projectsMap[project.id] = project.title;
            });
          }
          
          // Then try to fetch from projects table
          const { data: projectsData } = await supabase
            .from('projects')
            .select('id, title')
            .in('id', projectIds);
            
          if (projectsData && projectsData.length > 0) {
            projectsData.forEach(project => {
              projectsMap[project.id] = project.title;
            });
          }
        }
        
        // Format the regular tasks
        const formattedRegularTasks = (regularTasks || []).map(task => {
          const projectName = task.project_id && projectsMap[task.project_id] 
            ? projectsMap[task.project_id] 
            : 'مشروع غير محدد';
            
          return {
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status as TaskStatus,
            due_date: task.due_date,
            priority: task.priority,
            project_name: projectName,
            project_id: task.project_id,
            workspace_name: 'مساحة عمل افتراضية', // Default workspace name
            is_subtask: false
          };
        });
        
        // Fetch subtasks assigned to the user
        const { data: subtasks, error: subtasksError } = await supabase
          .from('subtasks')
          .select(`
            id,
            title,
            description,
            status,
            due_date,
            priority,
            task_id
          `)
          .eq('assigned_to', user.id);
        
        if (subtasksError) {
          console.error("Error fetching subtasks:", subtasksError);
          throw subtasksError;
        }
        
        // Get parent task ids from subtasks
        const taskIds = subtasks
          ?.filter(subtask => subtask.task_id)
          .map(subtask => subtask.task_id) || [];
        
        // Get parent task details to determine project and workspace
        const parentTasksMap = {};
        
        if (taskIds.length > 0) {
          // Try to get parent tasks from both tables
          const { data: parentTasks } = await supabase
            .from('tasks')
            .select('id, title, project_id')
            .in('id', taskIds);
            
          if (parentTasks && parentTasks.length > 0) {
            parentTasks.forEach(task => {
              parentTasksMap[task.id] = {
                title: task.title,
                project_id: task.project_id
              };
            });
          }
          
          // Also check portfolio_tasks
          const { data: portfolioParentTasks } = await supabase
            .from('portfolio_tasks')
            .select(`
              id, 
              title,
              portfolio_only_projects(name),
              portfolio_workspaces(name)
            `)
            .in('id', taskIds);
            
          if (portfolioParentTasks && portfolioParentTasks.length > 0) {
            portfolioParentTasks.forEach(task => {
              let projectName = 'مشروع غير محدد';
              if (task.portfolio_only_projects && 
                  Array.isArray(task.portfolio_only_projects) && 
                  task.portfolio_only_projects.length > 0) {
                projectName = task.portfolio_only_projects[0].name;
              }
              
              let workspaceName = '';
              if (task.portfolio_workspaces && 
                  Array.isArray(task.portfolio_workspaces) && 
                  task.portfolio_workspaces.length > 0) {
                workspaceName = task.portfolio_workspaces[0].name;
              }
              
              parentTasksMap[task.id] = {
                title: task.title,
                project_name: projectName,
                workspace_name: workspaceName
              };
            });
          }
        }
        
        // Format subtasks
        const formattedSubtasks = (subtasks || []).map(subtask => {
          const parentTask = parentTasksMap[subtask.task_id] || {};
          const parentProjectId = parentTask.project_id;
          
          let projectName = parentTask.project_name || 'مشروع غير محدد';
          if (!parentTask.project_name && parentProjectId && projectsMap[parentProjectId]) {
            projectName = projectsMap[parentProjectId];
          }
          
          return {
            id: subtask.id,
            title: subtask.title,
            description: subtask.description,
            status: subtask.status as TaskStatus,
            due_date: subtask.due_date,
            priority: subtask.priority || 'medium',
            project_name: projectName,
            workspace_name: parentTask.workspace_name || 'مساحة عمل افتراضية',
            is_subtask: true,
            parent_task_id: subtask.task_id
          };
        });
        
        // Combine all types of tasks
        const allTasks = [...formattedPortfolioTasks, ...formattedRegularTasks, ...formattedSubtasks];
        
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
