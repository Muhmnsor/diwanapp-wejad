

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  due_date: string | null;
  assigned_to: string | null;
  stage_id: string | null;
  stage_name?: string;
  assigned_user_name?: string;
  priority?: string | null;
}

export interface Subtask {
  id: string;
  parent_task_id: string;
  title: string;
  status: string;
  created_at?: string;
  due_date: string | null;
  assigned_to: string | null;
}

export interface ProjectMember {
  id: string;
  user_id: string;
  user_email: string;
  user_display_name: string | null;
  role: string;
}
