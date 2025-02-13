
export type EventType = 'online' | 'in-person';
export type BeneficiaryType = 'men' | 'women' | 'both';
export type EventPathType = 'environment' | 'community' | 'content';
export type EventCategoryType = 
  | 'social' | 'entertainment' | 'service' | 'educational' | 'consulting'
  | 'interest' | 'specialization'
  | 'spiritual' | 'cultural' | 'behavioral' | 'skill' | 'health' | 'diverse';

export interface RegistrationFields {
  arabic_name: boolean;
  english_name: boolean;
  education_level: boolean;
  birth_date: boolean;
  national_id: boolean;
  email: boolean;
  phone: boolean;
  gender: boolean;
  work_status: boolean;
}

export interface BaseEventData {
  title: string;
  description?: string;
  max_attendees: number;
  image_url: string;
  event_type: EventType;
  price: number | null;
  beneficiary_type: BeneficiaryType;
  certificate_type: string;
  event_path: EventPathType;
  event_category: EventCategoryType;
  registration_start_date: string | null;
  registration_end_date: string | null;
  event_hours?: number;
  registration_fields?: RegistrationFields;
}
