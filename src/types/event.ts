
export type BeneficiaryType = 'men' | 'women' | 'both';
export type EventType = 'online' | 'in-person';
export type EventPathType = 'environment' | 'community' | 'content';
export type EventCategoryType = 
  | 'social' | 'entertainment' | 'service' | 'educational' | 'consulting' // for environment
  | 'interest' | 'specialization' // for community
  | 'spiritual' | 'cultural' | 'behavioral' | 'skill' | 'health' | 'diverse'; // for content

export interface Event {
  id?: string;
  title: string;
  description: string;
  date: string;
  end_date?: string;
  time: string;
  location: string;
  location_url?: string;
  image_url: string;
  attendees: number;
  max_attendees: number;
  event_type: EventType;
  price: number | null;
  beneficiary_type: BeneficiaryType;
  registration_start_date: string | null;
  registration_end_date: string | null;
  certificate_type: string;
  event_hours: number | null;
  event_path: EventPathType;
  event_category: EventCategoryType;
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
}
