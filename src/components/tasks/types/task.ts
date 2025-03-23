
import { DependencyType } from "../project-details/types/dependency";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string | null;
  due_date: string | null;
  assigned_to: string | null;
  created_at: string;
  created_by?: string;
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
  assigned_user_name?: string;
  stage_name?: string;
  // Dependency fields
  dependencies?: Task[];
  dependent_tasks?: Task[];
  // Task dependency tracking fields
  dependency_ids?: string[];
  dependent_task_ids?: string[];
  // Dependency type
  dependency_type?: DependencyType;
  // Required deliverables flag
  requires_deliverable?: boolean;
  // Reference to the linked general task or meeting task
  general_task_id?: string;
}
