
export interface TaskComment {
  id: string;
  task_id: string;
  content: string;
  created_at: string;
  created_by: string | null;
  attachment_url?: string;
  attachment_name?: string;
  attachment_type?: string;
  profiles?: {
    display_name?: string;
    email?: string;
  } | null;
}
