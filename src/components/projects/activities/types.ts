export interface ProjectActivityFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  location_url?: string;
  special_requirements?: string;
  attendees: number;
  max_attendees: number;
  event_type: "online" | "in-person";
  price: number | null;
  beneficiary_type: "men" | "women" | "both";
  certificate_type: string;
  event_path: string;
  event_category: string;
  event_hours: number;
  image_url: string;
}