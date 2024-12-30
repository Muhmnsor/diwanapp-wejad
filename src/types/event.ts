export type EventPathType = "environment" | "community" | "content";
export type EventCategoryType = "social" | "educational" | "cultural" | "sports" | "other";

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  location_url?: string;
  image_url: string;
  event_type: "online" | "in-person";
  price: number | null;
  max_attendees: number;
  registration_start_date?: string;
  registration_end_date?: string;
  beneficiary_type: "men" | "women" | "both";
  certificate_type: string;
  event_hours?: number;
  event_path: EventPathType;
  event_category: EventCategoryType;
  special_requirements?: string;
  is_project_activity?: boolean;
  project_id?: string;
}