
import { supabase } from "@/integrations/supabase/client";

export const fetchUserProjects = async () => {
  const { data: projectsData } = await supabase
    .from('project_tasks')
    .select('id, title');
  
  console.log("Projects data:", projectsData);
  
  return projectsData || [];
};

export const fetchUserPortfolioTasks = async (userId: string) => {
  const { data, error } = await supabase
    .from('portfolio_tasks')
    .select(`
      id, title, description, status, priority, due_date, project_id,
      portfolio_only_projects (id, name),
      portfolio_workspaces (id, name),
      requires_deliverable
    `)
    .eq('assigned_to', userId);
    
  if (error) {
    console.error("Error fetching portfolio tasks:", error);
  } else {
    console.log("Portfolio tasks fetched:", data);
  }
  
  return { data: data || [], error };
};

export const fetchUserRegularTasks = async (userId: string) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, requires_deliverable')
    .eq('assigned_to', userId);
    
  if (error) {
    console.error("Error fetching regular tasks:", error);
  } else {
    console.log("Regular tasks fetched:", data);
  }
  
  return { data: data || [], error };
};

export const fetchAllTasks = async () => {
  const { data, error } = await supabase
    .from('tasks')
    .select('id, title, project_id, requires_deliverable');
    
  if (error) {
    console.error("Error fetching all tasks:", error);
  }
  
  return data || [];
};

export const fetchUserSubtasks = async (userId: string) => {
  const { data, error } = await supabase
    .from('subtasks')
    .select('*, requires_deliverable')
    .eq('assigned_to', userId);
    
  if (error) {
    console.error("Error fetching subtasks:", error);
  } else {
    console.log("Subtasks fetched:", data);
  }
  
  return { data: data || [], error };
};

export const checkPendingSubtasks = async (taskId: string) => {
  const { data, error } = await supabase
    .from('subtasks')
    .select('status')
    .eq('task_id', taskId)
    .not('status', 'eq', 'completed');
    
  if (error) {
    return { hasPendingSubtasks: false, error: error.message };
  }
  
  return { hasPendingSubtasks: data && data.length > 0, error: null };
};
