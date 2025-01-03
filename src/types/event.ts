export type BeneficiaryType = "male" | "female" | "both";
export type EventType = "online" | "in-person";
export type EventPathType = "environment" | "community" | "content";
export type EventCategoryType = 
  | "social"
  | "entertainment"
  | "service"
  | "educational"
  | "consulting"
  | "interest"
  | "specialization"
  | "spiritual"
  | "cultural"
  | "behavioral"
  | "skill"
  | "health"
  | "diverse";

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image_url: string;
  event_type: EventType;
  price: number | null;
  max_attendees: number;
  registration_start_date?: string | null;
  registration_end_date?: string | null;
  beneficiary_type: BeneficiaryType;
  certificate_type?: string;
  event_hours?: number;
  location_url?: string;
  event_path?: EventPathType;
  event_category?: EventCategoryType;
  is_visible?: boolean;
  is_project_activity?: boolean;
  project_id?: string;
  end_date?: string;
}