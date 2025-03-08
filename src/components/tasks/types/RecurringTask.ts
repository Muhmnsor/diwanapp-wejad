
export interface RecurringTask {
  id: string;
  title: string;
  description: string | null;
  recurrence_type: string;
  interval: number;
  day_of_month?: number | null;
  day_of_week?: number | null;
  priority: string;
  category?: string | null;
  project_id?: string | null;
  workspace_id?: string | null;
  created_by: string;
  created_at: string;
  is_active: boolean;
  assign_to: string | null;
  last_generated_date: string | null;
  next_generation_date: string | null;
  
  // Define related objects as optional single objects (not arrays)
  projects?: { title: string } | null;
  workspaces?: { name: string } | null;
  profiles?: { display_name: string } | null;
  
  // Convenience properties for nested data
  project_name?: string | null;
  workspace_name?: string | null;
  assignee_name?: string | null;
  requires_deliverable?: boolean;
}
