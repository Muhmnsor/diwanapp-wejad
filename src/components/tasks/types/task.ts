
export interface Task {
  id: string;
  title: string;
  description: string | null;  // Changed to required to match project-details Task
  status: string;
  priority: string;
  due_date: string | null;
  assigned_to: string | null;
  assigned_user_name?: string | null;
  created_at: string;
  updated_at?: string;
  is_subtask?: boolean;
  parent_task_id?: string | null;
  workspace_id?: string | null;
  project_id?: string | null;
  project_name?: string | null;
  workspace_name?: string | null;
  stage_id: string | null;  // Made required to match project-details Task
  stage_name?: string | null;
  stage_color?: string | null;
  // Additional properties
  start_date?: string | null;
  is_draft?: boolean;
  category?: string | null;
  is_general?: boolean;
  project_manager?: string | null;
  // Properties for templates and attachments
  attachment_url?: string | null;
  form_template?: string | null;
  templates?: Array<{ url: string }> | null;
}
