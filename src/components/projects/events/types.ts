import { EventPathType, EventCategoryType } from "@/types/event";

export interface ProjectEventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  location_url?: string;
  special_requirements?: string;
  max_attendees: number;
  event_type: "online" | "in-person";
  price: number | null;
  beneficiary_type: "men" | "women" | "both";
  certificate_type: string;
  event_path: EventPathType;
  event_category: EventCategoryType;
  event_hours: number;
  image_url: string;
}