
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string; // Changed from enum to string to be compatible with both Task implementations
  priority: string; // Changed from enum to string to be compatible with both Task implementations
  due_date?: string;
  created_at: string;
  created_by?: string;
  assigned_to?: string;
  assignee_name?: string;
  workspace_id?: string;
  project_id?: string;
  stage_id?: string;
  category?: string;
  requires_deliverable?: boolean;
  is_recurring?: boolean;
  recurring_id?: string;
  meeting_id?: string;
  is_general?: boolean;
  dependency_type?: string;
  assigned_user_name?: string;
}

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  status: string; // Changed from enum to string to be compatible
  created_at: string;
  created_by?: string;
  assigned_to?: string;
  assignee_name?: string;
  due_date?: string;
}
