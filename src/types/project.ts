
import { EventType, BeneficiaryType, EventPathType, EventCategoryType } from './event';

export interface Project {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  max_attendees: number;
  price: number | null;
  image_url: string;
  event_type: EventType;
  beneficiary_type: BeneficiaryType;
  certificate_type: string;
  event_path: EventPathType;
  event_category: EventCategoryType;
  registration_start_date: string | null;
  registration_end_date: string | null;
  is_visible?: boolean;
  attendance_requirement_type?: string;
  project_type?: string;
  registration_fields?: {
    arabic_name: boolean;
    email: boolean;
    phone: boolean;
    english_name: boolean;
    education_level: boolean;
    birth_date: boolean;
    national_id: boolean;
    gender: boolean;
    work_status: boolean;
  };
}
