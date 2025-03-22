
export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  assigned_to: string | null;
  created_at: string;
  project_id?: string;
  stage_id?: string;
  is_general?: boolean;
  workspace_id?: string | null;
  category?: string | null;
  created_by?: string;
  updated_at?: string;
  requires_deliverable?: boolean;
  meeting_id?: string; // إضافة معرف الاجتماع
}
