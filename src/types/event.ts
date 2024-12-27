export type BeneficiaryType = 'men' | 'women' | 'both';

export type EventPathType = 'environment' | 'community' | 'content';
export type EventCategoryType = 
  | 'social' | 'entertainment' | 'service' | 'educational' | 'consulting' // for environment
  | 'interest' | 'specialization' // for community
  | 'spiritual' | 'cultural' | 'behavioral' | 'skill' | 'health' | 'diverse'; // for content

export interface EventType {
  id?: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  location_url?: string;
  imageUrl?: string;
  image_url?: string;
  attendees: number;
  max_attendees: number;
  event_type?: "online" | "in-person";
  eventType?: "online" | "in-person";
  price: number | "free";
  beneficiaryType?: BeneficiaryType;
  beneficiary_type?: BeneficiaryType;
  registrationStartDate?: string | null;
  registrationEndDate?: string | null;
  registration_start_date?: string | null;
  registration_end_date?: string | null;
  certificate_type?: string;
  certificateType?: string;
  event_hours?: number | null;
  eventHours?: number | null;
  event_path?: EventPathType;
  event_category?: EventCategoryType;
}