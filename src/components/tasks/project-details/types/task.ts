
export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  assigned_to: string | null;
  assigned_user_name?: string | null;
  priority: string | null;
  created_at: string;
  start_date?: string | null;
  stage_id: string | null;
  stage_name?: string;
  stage_color?: string;
  // Properties for general tasks
  category?: string | null;
  is_general?: boolean;
  // Project related properties
  project_id?: string | null;
  project_name?: string | null;
  workspace_id?: string | null;
  workspace_name?: string | null;
  project_manager?: string | null;
  // Draft properties
  is_draft?: boolean;
  // Subtask properties
  is_subtask?: boolean;
  parent_task_id?: string | null;
  // Properties for templates and attachments
  attachment_url?: string | null;
  form_template?: string | null;
  templates?: Array<{ url: string }> | null;
}
