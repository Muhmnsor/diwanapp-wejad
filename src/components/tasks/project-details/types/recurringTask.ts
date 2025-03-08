
export interface RecurringTask {
  id?: string;
  title: string;
  description?: string | null;
  recurrence_type: 'daily' | 'weekly' | 'monthly';
  interval?: number;
  day_of_month?: number | null;
  day_of_week?: number | null;
  priority: 'low' | 'medium' | 'high';
  category?: string | null;
  project_id?: string | null;
  workspace_id?: string | null;
  created_by?: string;
  is_active?: boolean;
  assign_to?: string | null;
  requires_deliverable?: boolean;
  last_generated_date?: string | null;
  next_generation_date?: string | null;
}

export interface RecurringTaskFormData {
  title: string;
  description: string;
  recurrenceType: 'daily' | 'weekly' | 'monthly';
  interval?: number;
  dayOfMonth?: number | null;
  dayOfWeek?: number | null;
  priority: 'low' | 'medium' | 'high';
  category?: string | null;
  projectId?: string | null;
  workspaceId?: string | null;
  assignTo?: string | null;
  requiresDeliverable?: boolean;
}
