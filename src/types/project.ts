
import { EventPathType, EventCategoryType } from "./event";

export interface Project {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  max_attendees: number;
  image_url: string;
  event_type: "online" | "in-person";
  price: number | null;
  beneficiary_type: "men" | "women" | "both";
  certificate_type: string;
  event_path: EventPathType;
  event_category: EventCategoryType;
  registration_start_date: string | null;
  registration_end_date: string | null;
  is_visible?: boolean;
  event_hours?: number;
  registration_fields?: {
    arabic_name: boolean;
    english_name: boolean;
    education_level: boolean;
    birth_date: boolean;
    national_id: boolean;
    email: boolean;
    phone: boolean;
    gender: boolean;
    work_status: boolean;
  };
  attendance_requirement_type?: string;
}
