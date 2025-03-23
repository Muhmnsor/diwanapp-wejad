
// If this file doesn't exist, create it

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskType = 'action_item' | 'follow_up' | 'decision' | 'preparation' | 'execution' | 'other';

export interface MeetingTask {
  id: string;
  meeting_id: string;
  title: string;
  description?: string;
  due_date?: string;
  assigned_to?: string;
  task_type: TaskType;
  status: TaskStatus;
  created_at: string;
  updated_at?: string;
  created_by?: string;
  add_to_general_tasks?: boolean;
  requires_deliverable?: boolean;
  priority: "high" | "medium" | "low";
  general_task_id?: string;
}
