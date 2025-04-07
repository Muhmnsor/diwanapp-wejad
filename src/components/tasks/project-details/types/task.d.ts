
import { DependencyType } from "./dependency";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  assigned_to: string | null;
  assigned_user_name?: string;
  assignee_name?: string;
  priority: string | null;
  created_at: string;
  created_by?: string;
  stage_id?: string;
  stage_name?: string;
  // Properties for general tasks
  category?: string | null;
  is_general?: boolean;
  // Meeting related properties
  meeting_id?: string | null;
  task_type?: string | null;
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
  // Dependency properties
  dependencies?: Task[];
  dependent_tasks?: Task[];
  // Additional fields for task dependencies tracking
  dependency_ids?: string[];
  dependent_task_ids?: string[];
  // Dependency type
  dependency_type?: DependencyType;
  // Required deliverables flag
  requires_deliverable?: boolean;
}
