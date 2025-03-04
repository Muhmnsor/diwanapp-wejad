
import { supabase } from "@/integrations/supabase/client";
import { Task } from "../types/task";

// استرجاع المهام من جدول المهام العادية
export const fetchRegularTasks = async (userId: string) => {
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
    .eq('assigned_to', userId);
  
  if (tasksError) {
    console.error("Error fetching tasks:", tasksError);
    throw tasksError;
  }
  
  return regularTasks || [];
};

// استرجاع المهام من جدول مهام المحفظة
export const fetchPortfolioTasks = async (userId: string) => {
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
    .eq('assigned_to', userId);
  
  if (portfolioError) {
    console.error("Error fetching portfolio tasks:", portfolioError);
    throw portfolioError;
  }
  
  return portfolioTasks || [];
};

// استرجاع المهام الفرعية
export const fetchSubtasks = async (userId: string) => {
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
    .eq('assigned_to', userId);
  
  if (subtasksError) {
    console.error("Error fetching subtasks:", subtasksError);
    throw subtasksError;
  }
  
  return subtasks || [];
};

// استرجاع بيانات المشاريع للمهام العادية
export const fetchProjectDetails = async (projectIds: string[]) => {
  if (projectIds.length === 0) return {};
  
  let projectsMap = {};
  
  // التحقق من جدول مهام المشاريع
  const { data: projectTasksData } = await supabase
    .from('project_tasks')
    .select('id, title')
    .in('id', projectIds);
    
  if (projectTasksData && projectTasksData.length > 0) {
    projectTasksData.forEach(project => {
      projectsMap[project.id] = project.title;
    });
  }
  
  // التحقق من جدول المشاريع العام
  const { data: projectsData } = await supabase
    .from('projects')
    .select('id, title')
    .in('id', projectIds);
    
  if (projectsData && projectsData.length > 0) {
    projectsData.forEach(project => {
      projectsMap[project.id] = project.title;
    });
  }
  
  return projectsMap;
};

// استرجاع بيانات المهام الرئيسية للمهام الفرعية
export const fetchParentTasks = async (taskIds: string[]) => {
  if (taskIds.length === 0) return {};
  
  const parentTasksMap = {};
  
  // التحقق من جدول المهام العادية
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
  
  // التحقق من جدول مهام المحفظة
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
  
  return parentTasksMap;
};
