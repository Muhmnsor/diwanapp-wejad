
import { create } from 'zustand';
import { BeneficiaryType, EventPathType, EventCategoryType } from '@/types/event';

export interface Event {
  id?: string;
  title: string;
  description: string;
  date: string;
  end_date?: string;
  time: string;
  location: string;
  location_url?: string;
  imageUrl?: string;
  image_url?: string;
  attendees: number;
  max_attendees: number;
  event_type: "online" | "in-person";
  eventType?: "online" | "in-person";
  price: number | "free";
  beneficiaryType: BeneficiaryType;
  beneficiary_type?: BeneficiaryType;
  registrationStartDate?: string | null;
  registrationEndDate?: string | null;
  registration_start_date?: string | null;
  registration_end_date?: string | null;
  certificate_type: string;
  certificateType?: string;
  event_hours: number;
  eventHours?: number;
  event_path: EventPathType;
  event_category: EventCategoryType;
  is_visible?: boolean;
  is_project_activity?: boolean;
  project_id?: string;
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
  // إضافة حقول مخصصة للنموذج
  customForm?: {
    id: string;
    title: string;
    description?: string;
    fields: Array<{
      id: string;
      type: string;
      label: string;
      required?: boolean;
      placeholder?: string;
      description?: string;
      options?: Array<{
        label: string;
        value: string;
      }>;
      config?: {
        alertType?: string;
        maxFileSize?: number;
        allowedFileTypes?: string[];
      };
    }>;
  };
}

interface EventStore {
  events: Event[];
  addEvent: (event: Event) => void;
  updateEvent: (index: number, event: Event) => void;
  deleteEvent: (index: number) => void;
}

export const useEventStore = create<EventStore>((set) => ({
  events: [],
  addEvent: (event) => set((state) => ({ 
    events: [...state.events, event] 
  })),
  updateEvent: (index, updatedEvent) => {
    console.log('Updating event at index:', index);
    console.log('Updated event data:', updatedEvent);
    
    set((state) => {
      const newEvents = [...state.events];
      newEvents[index] = updatedEvent;
      console.log('New events array:', newEvents);
      return { events: newEvents };
    });
  },
  deleteEvent: (index) => set((state) => {
    const newEvents = [...state.events];
    newEvents.splice(index, 1);
    return { events: newEvents };
  }),
}));
