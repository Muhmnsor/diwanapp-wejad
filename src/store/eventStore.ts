import { BeneficiaryType, EventPathType, EventCategoryType } from '@/types/event';

export interface Event {
  id?: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  location_url?: string;
  imageUrl?: string;
  image_url?: string;
  event_type: "online" | "in-person";
  price: number;
  max_attendees: number;
  beneficiary_type: BeneficiaryType;
  certificate_type?: string;
  event_hours?: number;
  event_path: EventPathType;
  event_category: EventCategoryType;
  // Project specific fields
  start_date?: string;
  end_date?: string;
  registration_start_date?: string;
  registration_end_date?: string;
}