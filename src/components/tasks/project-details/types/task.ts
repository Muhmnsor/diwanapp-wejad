
export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  assigned_to: string | null;
  assigned_user_name?: string;
  priority: string | null;
  created_at: string;
  stage_id: string | null;
  stage_name?: string;
  // Add category for general tasks
  category?: string | null;
  // Add flag to indicate if this is a general task
  is_general?: boolean;
  // Add missing properties for templates and attachments
  attachment_url?: string | null;
  form_template?: string | null;
  templates?: Array<{ url: string }> | null;
}
