
export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  assigned_to: string | null;
  assigned_user_name?: string | null; // Updated to be null-able
  priority: string | null;
  created_at: string;
  stage_id: string | null;
  stage_name?: string;
  // Properties for general tasks
  category?: string | null;
  is_general?: boolean;
  // Properties for templates and attachments
  attachment_url?: string | null;
  form_template?: string | null;
  templates?: Array<{ url: string }> | null;
  // Project related properties
  project_id?: string | null;
  project_name?: string | null;
  workspace_id?: string | null;
  workspace_name?: string | null;
  // Subtask properties
  is_subtask?: boolean;
  parent_task_id?: string | null;
}
