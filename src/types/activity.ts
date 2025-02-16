
export interface ProjectActivity {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  location: string;
  location_url?: string;
  activity_duration: number;
  special_requirements?: string;
  project_id: string;
  event_id?: string;
  is_visible?: boolean;
  created_at?: string;
}

export interface ProjectActivityFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  activity_duration: number;
  location: string;
  location_url?: string;
  special_requirements?: string;
}
