export interface ProjectActivity {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  location_url?: string;
  event_hours: number;
  special_requirements?: string;
}

export interface ProjectActivityFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  location_url?: string;
  event_hours: number;
  special_requirements?: string;
}