import { BeneficiaryType, EventPathType, EventCategoryType } from "./event";

export interface ProjectActivity {
  id?: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  location_url?: string;
  image_url: string;
  max_attendees: number;
  event_type: "online" | "in-person";
  price: number | null;
  beneficiary_type: BeneficiaryType;
  certificate_type: string;
  event_path: EventPathType;
  event_category: EventCategoryType;
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
  special_requirements?: string;
  max_attendees: number;
  event_type: "online" | "in-person";
  price: number | null;
  beneficiary_type: BeneficiaryType;
  certificate_type: string;
  event_path: EventPathType;
  event_category: EventCategoryType;
  event_hours: number;
  image_url: string;
}