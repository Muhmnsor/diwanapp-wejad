
export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  assigned_to: string | null;
  assigned_user_name?: string;
  priority: string | null;
  created_at: string;
  stage_id: string | null;
  stage_name?: string;
}

export interface Subtask {
  id: string;
  parent_task_id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  assigned_to: string | null;
  priority: string | null;
  created_at: string;
}
