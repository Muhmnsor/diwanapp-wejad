export type BeneficiaryType = 'men' | 'women' | 'both';

export interface EventType {
  id?: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl?: string;
  image_url?: string;
  attendees: number;
  max_attendees: number;
  event_type: "online" | "in-person";
  eventType: "online" | "in-person";
  price: number | "free";
  beneficiaryType: BeneficiaryType;
  registrationStartDate?: string | null;
  registrationEndDate?: string | null;
  registration_start_date?: string | null;
  registration_end_date?: string | null;
  certificate_type: string;
  certificateType: string;
  event_hours: number | null;
  eventHours: number | null;
}