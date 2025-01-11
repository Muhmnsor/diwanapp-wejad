export interface TaskProject {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  max_attendees: number;
  image_url: string;
  event_type: "online" | "in-person";
  price: number | null;
  beneficiary_type: "men" | "women" | "both";
  certificate_type: string;
  event_path: string;
  event_category: string;
  registration_start_date: string | null;
  registration_end_date: string | null;
  is_visible?: boolean;
  event_hours?: number;
  registration_fields?: {
    arabic_name: boolean;
    english_name: boolean;
    education_level: boolean;
    birth_date: boolean;
    national_id: boolean;
    email: boolean;
    phone: boolean;
    gender: boolean;
    work_status: boolean;
  };
}

export interface ProjectTask {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: string;
  due_date?: string;
  assigned_to?: string;
  asana_gid?: string;
  created_at: string;
  updated_at: string;
  task_subtasks?: TaskSubtask[];
}

export interface TaskSubtask {
  id: string;
  parent_task_id: string;
  title: string;
  description?: string;
  status: string;
  due_date?: string;
  assigned_to?: string;
  asana_gid?: string;
  created_at: string;
  updated_at: string;
}