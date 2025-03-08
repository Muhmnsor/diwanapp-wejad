
export interface RecurringTask {
  id?: string;
  title: string;
  description?: string | null;
  recurrence_type: 'daily' | 'weekly' | 'monthly';
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
}

export interface RecurringTaskFormData {
  title: string;
  description: string;
  recurrenceType: 'daily' | 'weekly' | 'monthly';
  dayOfMonth?: number | null;
  dayOfWeek?: number | null;
  priority: 'low' | 'medium' | 'high';
  category?: string | null;
  projectId?: string | null;
  workspaceId?: string | null;
  assignTo?: string | null;
  requiresDeliverable?: boolean;
}
