
export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  status: string;
  due_date?: string | null;
  assigned_to?: string | null;
  assigned_user_name?: string;
  priority?: string | null;
  created_at: string;
  created_by?: string;
  project_id?: string;
}
