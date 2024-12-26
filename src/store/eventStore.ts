import { create } from 'zustand';
import { BeneficiaryType } from '@/types/event';

export interface Event {
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
  eventType?: "online" | "in-person";
  price: number | "free";
  beneficiaryType: BeneficiaryType;
  registrationStartDate?: string | null;
  registrationEndDate?: string | null;
  registration_start_date?: string | null;
  registration_end_date?: string | null;
  certificate_type: string;
  certificateType?: string;
  event_hours: number;
  eventHours?: number;
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