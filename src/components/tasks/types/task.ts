
export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status?: string;
  priority?: string;
  due_date?: string | null;
  assigned_to?: string | null;
  assigned_user_name?: string | null; // Added this property
  created_at?: string;
  updated_at?: string;
  is_subtask?: boolean;
  parent_task_id?: string | null;
  workspace_id?: string | null;
  project_id?: string | null;
  project_name?: string | null;
  workspace_name?: string | null;
  stage_id?: string | null; // Added this missing property
  stage_name?: string | null; // Added for consistency
  stage_color?: string | null; // Added for consistency
  // Add missing properties for templates and attachments
  attachment_url?: string | null;
  form_template?: string | null;
  templates?: Array<{ url: string }> | null;
}
