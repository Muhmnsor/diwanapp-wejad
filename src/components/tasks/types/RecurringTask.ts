
export interface RecurringTask {
  id: string;
  title: string;
  description: string | null;
  recurrence_type: string;
  interval: number;
  day_of_month?: number | null;
  day_of_week?: number | null;
  priority: string;
  category?: string | null;
  project_id?: string | null;
  workspace_id?: string | null;
  created_by: string;
  created_at: string;
  is_active: boolean;
  assign_to: string | null;
  last_generated_date: string | null;
  next_generation_date: string | null;
  
  // Since Supabase join returns objects as arrays, we need to define them accordingly
  projects?: any[] | null;
  workspaces?: any[] | null;
  profiles?: any[] | null;
  
  // Convenience properties for nested data
  project_name?: string | null;
  workspace_name?: string | null;
  assignee_name?: string | null;
  requires_deliverable?: boolean;
}

// Helper functions to extract values from the potentially nested arrays
export const getProjectName = (task: RecurringTask): string | null => {
  if (!task.projects || task.projects.length === 0) return null;
  return task.projects[0]?.title || null;
};

export const getWorkspaceName = (task: RecurringTask): string | null => {
  if (!task.workspaces || task.workspaces.length === 0) return null;
  return task.workspaces[0]?.name || null;
};

export const getAssigneeName = (task: RecurringTask): string | null => {
  if (!task.profiles || task.profiles.length === 0) return null;
  return task.profiles[0]?.display_name || null;
};
