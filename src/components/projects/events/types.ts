export interface ProjectEventFormData {
  title: string;
  description?: string;
  date: string;
  time: string;
  location: string;
  location_url?: string;
  special_requirements?: string;
  attendees: number;
  max_attendees: number;
  event_type: "online" | "in-person";
  eventType: "online" | "in-person";
  price: number | null;
  beneficiary_type: "men" | "women" | "both";
  beneficiaryType: "men" | "women" | "both";
  certificate_type: "none" | "participation" | "appreciation" | "completion";
  certificateType: "none" | "participation" | "appreciation" | "completion";
  event_path: string;
  eventPath: string;
  event_category: string;
  eventCategory: string;
  event_hours: number;
  eventHours: number;
  image_url: string;
  imageUrl: string;
}