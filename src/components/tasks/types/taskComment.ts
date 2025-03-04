
export interface TaskComment {
  id: string;
  task_id: string;
  content: string;
  created_at: string;
  created_by: string | null;
  attachment_url?: string;
  attachment_name?: string;
  attachment_type?: string;
  // معلومات المستخدم المضافة من الـ profiles
  user_name?: string; // اسم المستخدم المعروض
  user_email?: string; // البريد الإلكتروني للمستخدم
}
