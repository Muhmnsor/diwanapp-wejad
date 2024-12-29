export interface ProjectActivityFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  event_hours: number;
  location: string;
  location_url?: string;
  special_requirements?: string;
}