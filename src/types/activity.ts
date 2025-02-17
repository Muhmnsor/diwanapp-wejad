
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
  is_visible?: boolean;
  created_at?: string;
  attendance_records?: Array<{
    id: string;
    status: string;
    registration_id: string;
    activity_id: string;
    created_at?: string;
  }>;
  activity_feedback?: Array<{
    id: string;
    overall_rating: number;
    content_rating: number;
    organization_rating: number;
    presenter_rating: number;
    feedback_text?: string;
    name?: string;
    phone?: string;
  }>;
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
