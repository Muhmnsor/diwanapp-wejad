
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  due_date?: string;
  assigned_to?: string;
  assigned_user_name?: string;
  created_at: string;
  project_id?: string;
  stage_id?: string;
}

export interface TaskAttachment {
  id: string;
  task_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  created_at: string;
}
