
import { create } from 'zustand';
import { BeneficiaryType, EventType, EventPathType, EventCategoryType } from '@/types/event';

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
  imageUrl?: string;
  attendees: number;
  max_attendees: number;
  event_type: EventType;
  eventType?: EventType;
  price: number | null;
  beneficiary_type: BeneficiaryType;
  beneficiaryType?: BeneficiaryType;
  registration_start_date: string | null;
  registration_end_date: string | null;
  registrationStartDate?: string | null;
  registrationEndDate?: string | null;
  certificate_type: string;
  certificateType?: string;
  event_hours: number | null;
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
