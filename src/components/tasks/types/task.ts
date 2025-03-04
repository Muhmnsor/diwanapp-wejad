
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
