
export interface TaskComment {
  id: string;
  task_id: string;
  content: string;
  created_at: string;
  created_by: string | null;
  attachment_url?: string | null;
  attachment_name?: string | null;
  attachment_type?: string | null;
  profiles?: {
    display_name: string | null;
    email: string | null;
  } | null;
}
