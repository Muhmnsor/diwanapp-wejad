
export interface TaskComment {
  id: string;
  task_id: string;
  content: string;
  created_at: string;
  created_by: string | null;
  profiles?: {
    display_name: string | null;
    email: string | null;
  };
}
