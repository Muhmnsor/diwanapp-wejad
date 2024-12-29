export interface ProjectEventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  location_url?: string;
  special_requirements?: string;
  attendees?: number;
  max_attendees: number;
  event_type: "online" | "in-person";
  price: number | null;
  beneficiary_type: "men" | "women" | "both";
  beneficiaryType: "men" | "women" | "both";
  certificate_type?: string;
  certificateType?: string;
  event_path: string;
  eventPath?: string;
  event_category: string;
  eventCategory?: string;
  event_hours?: number;
  eventHours?: number;
  image_url: string;
  imageUrl?: string;
}