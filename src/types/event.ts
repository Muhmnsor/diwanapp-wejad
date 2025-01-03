export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  end_date?: string;
  time: string;
  location: string;
  location_url?: string;
  image_url: string;
  event_type: string;
  price?: number;
  max_attendees: number;
  registration_start_date?: string;
  registration_end_date?: string;
  beneficiary_type: string;
  certificate_type?: string;
  event_hours?: number;
  event_path: string;
  event_category: string;
  special_requirements?: string;
  is_visible?: boolean;
  is_project_activity?: boolean;
  project_id?: string;
}

export interface EventCardProps extends Event {
  className?: string;
}