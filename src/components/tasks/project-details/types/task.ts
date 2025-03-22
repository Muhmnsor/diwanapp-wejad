
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  priority: 'low' | 'medium' | 'high';
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
  meeting_id?: string; // Added meeting_id property
}

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  status: 'pending' | 'completed';
  created_at: string;
  created_by?: string;
  assigned_to?: string;
  assignee_name?: string;
  due_date?: string;
}
