
export interface Workspace {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  created_at: string;
  created_by?: string;
  total_tasks?: number;
  completed_tasks?: number;
  pending_tasks?: number;
  members_count?: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  created_at: string;
  created_by?: string;
  assigned_to?: string;
  workspace_id: string;
  workspace_name?: string;
  project_id?: string;
  project_name?: string;
  start_date?: string; // تاريخ بداية المهمة لمخطط جانت
  end_date?: string; // تاريخ نهاية المهمة لمخطط جانت
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'cancelled';
  start_date?: string;
  end_date?: string;
  created_at: string;
  created_by?: string;
  workspace_id: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: 'admin' | 'member' | 'viewer';
  joined_at: string;
  user_email?: string;
  user_display_name?: string;
}

