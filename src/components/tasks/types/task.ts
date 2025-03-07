
export interface Task {
  id: string;
  title: string;
  description?: string | null; // Made optional to match project-details Task interface
  status?: string;
  priority?: string;
  due_date?: string | null;
  assigned_to?: string | null;
  created_at?: string;
  updated_at?: string;
  is_subtask?: boolean;
  parent_task_id?: string | null;
  workspace_id?: string | null;
  project_id?: string | null;
  project_name?: string | null;
  workspace_name?: string | null;
  is_general?: boolean;
  attachment_url?: string | null;
  form_template?: string | null;
  templates?: Array<{ url: string }> | null;
  category?: string | null;
  stage_id?: string;
}
