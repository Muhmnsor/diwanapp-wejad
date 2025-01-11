export interface ProjectTask {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: string;
  due_date?: string;
  assigned_to?: string;
  asana_gid?: string;
  created_at: string;
  updated_at: string;
  task_subtasks?: TaskSubtask[];
}

export interface TaskSubtask {
  id: string;
  parent_task_id: string;
  title: string;
  description?: string;
  status: string;
  due_date?: string;
  assigned_to?: string;
  asana_gid?: string;
  created_at: string;
  updated_at: string;
}